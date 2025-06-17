"""
# Vector Database with Whisper, OpenAI, FAISS and ElevenLabs
This script transcribes an audio file using Whisper, embeds the text with OpenAI's embedding model,
indexes it with FAISS, and optionally generates a response using OpenAI's GPT model and synthesizes speech with ElevenLabs.
# Requirements:
- whisper
- openai
- faiss-cpu
- numpy
- elevenlabs

# Usage:
1. Set your OpenAI and ElevenLabs API keys as environment variables:
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
2. Place your audio file named `my_recording.wav` in the same directory as this script.
# 3. Run the script:
Example:
```bash
>>> python main.py
```

Author: Samudra Gargo Bhattacharya
# Date: 2023-10-01
"""

import os
import whisper
import openai
import faiss
import numpy as np
from datetime import datetime
from elevenlabs import set_api_key, generate, play, voices


# Import the ElevenLabs helpers you actually need

openai.api_key     = os.getenv("OPENAI_API_KEY",  "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")
ELEVEN_API_KEY     = os.getenv("ELEVENLABS_API_KEY","sk_d253a77e463123a77abecfb440bcdfee637fbafc3bbc1340")


set_api_key(ELEVEN_API_KEY)

# ─── TRANSCRIBE ───────────────────────────────────
model    = whisper.load_model("large")
r        = model.transcribe("my_recording.wav")
text     = r["text"].strip()
timestamp= datetime.now().strftime("%Y-%m-%d %H:%M:%S")


print(f" Transcribed at {timestamp}: «{text}»")

# ─── EMBED & INDEX ───────────────────────────────
emb = openai.Embedding.create(
    input=text,
    model="text-embedding-ada-002"
)
vec = np.array(emb["data"][0]["embedding"], dtype="float32")
faiss.normalize_L2(vec.reshape(1,-1))

d = vec.shape[0]
if os.path.exists("faiss.index"):
    index = faiss.read_index("faiss.index")
else:
    index = faiss.IndexFlatIP(d)

index.add(vec.reshape(1,d))
faiss.write_index(index, "faiss.index")


# ─── ASK GPT 
if text.startswith("Kaipo"):
    resp = openai.ChatCompletion.create(
      model="gpt-3.5-turbo",
      messages=[
        {"role":"system","content":"You are a helpful assistant."},
        {"role":"user","content": text}
      ]
    )
    answer = resp.choices[0].message.content.strip()
    print(" ** ", answer)

    audio = generate(text=answer, voice="Aria", model="eleven_monolingual_v1")
    play(audio)

else:
    print("📄 Logged (response not needed).") 