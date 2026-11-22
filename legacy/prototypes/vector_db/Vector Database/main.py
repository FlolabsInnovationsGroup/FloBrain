import os

os.environ["KMP_DUPLICATE_LIB_OK"] = "True"
print("❓ CWD is:", os.getcwd())
print("❓ Files here:", os.listdir(os.getcwd()))
import whisper
import faiss
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from elevenlabs.client import ElevenLabs
from elevenlabs import play
from rapidfuzz import process
from dotenv import load_dotenv, find_dotenv
import os
from dotenv import load_dotenv, find_dotenv

dotenv_path = find_dotenv()
print("→ loading .env from", dotenv_path)


load_dotenv(dotenv_path, override=True, encoding="utf-8")

dotenv_path = find_dotenv()
print("→ loading .env from", dotenv_path)
load_dotenv(dotenv_path, override=True)

openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
eleven = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

print("🔑 OPENAI:", bool(os.getenv("OPENAI_API_KEY")))
print("🔑 ELEVENLABS:", bool(os.getenv("ELEVENLABS_API_KEY")))

# ─── TRANSCRIBE ───────────────────────────────────────
audio_path = "my_recording.wav"
print("🎤 Transcribing:", audio_path)

model   = whisper.load_model("large")
r       = model.transcribe(audio_path)
text    = r["text"].strip()
ts      = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
print(f"📄 Transcribed at {ts}: «{text}»")

# ─── CORRECT “Kaipo” ───────────────────────────────────
def correct_transcription(txt, target="Kaipo", thresh=75):
    out = []
    for w in txt.split():
        match, score, _ = process.extractOne(w, [target])
        if score >= thresh:
            print(f"  ↳ corrected '{w}' → '{target}' (score {score})")
            out.append(target)
        else:
            out.append(w)
    return " ".join(out)

text = correct_transcription(text)
print(f"📄 Corrected: «{text}»")

# ─── LOG FOR MEMORY ────────────────────────────────────
with open("transcripts.txt", "a", encoding="utf-8") as f:
    f.write(text + "\n")
print("📝 Appended to transcripts.txt")

# ─── EMBED & INDEX ─────────────────────────────────────
# 1) Create embedding
emb_resp = openai.embeddings.create(
    model="text-embedding-ada-002",
    input=text
)
vec = np.array(emb_resp.data[0].embedding, dtype="float32")
faiss.normalize_L2(vec.reshape(1, -1))

# 2) Load or init FAISS index
d = vec.shape[0]
idx_path = "faiss.index"
if os.path.exists(idx_path):
    index = faiss.read_index(idx_path)
else:
    index = faiss.IndexFlatIP(d)

# 3) Add our vector
index.add(vec.reshape(1, d))
faiss.write_index(index, idx_path)
print(f"⚙️ Indexed (total vectors: {index.ntotal})")

# ─── HANDLE “Kaipo” QUERIES ────────────────────────────
if text.lower().startswith("kaipo"):
    # 1) Retrieve most-similar past entry
    D, I = index.search(vec.reshape(1, d), k=1)
    sim_score = float(D[0][0])
    print(f"🔎 Memory similarity: {sim_score:.3f} (idx {I[0][0]})")

    past = "-"
    with open("transcripts.txt", "r", encoding="utf-8") as f:
        lines = f.read().splitlines()
        if 0 <= I[0][0] < len(lines):
            past = lines[I[0][0]]
            print("🕰️ Recalled:", past)

    # 2) Build GPT prompt with context
    messages = [{"role":"system","content":"You are a helpful assistant."}]
    if sim_score > 0.7:
        messages.append({
            "role":"user",
            "content": f"Previously I said: “{past}”"
        })
    messages.append({"role":"user","content":text})

    # 3) Ask GPT
    chat = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    answer = chat.choices[0].message.content.strip()
    print("💬 GPT:", answer)

    # 4) Speak back
    audio = eleven.text_to_speech.convert(
        text=answer,
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128"
    )
    play(audio)
    print("🔊 Played TTS")

else:
    print("📄 Logged (not a question).")