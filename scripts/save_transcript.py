import os
from google.cloud import firestore
from sentence_transformers import SentenceTransformer

# SET THIS to your actual credentials file
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gcp-key.json"

# Your transcript (replace with actual Whisper output or automate)
transcription_text = "your transcription here"  # <--- Replace this!
audio_gcs_url = "gs://your-bucket-name/audio/output.wav"  # <--- Replace this!

# Step 1: Generate embedding
model = SentenceTransformer('all-MiniLM-L6-v2')
embedding = model.encode(transcription_text).tolist()  # List of floats

# Step 2: Save to Firestore
db = firestore.Client()
collection = db.collection("transcripts")

doc = {
    "text": transcription_text,
    "audio_file": audio_gcs_url,
    "embedding": embedding
}

collection.add(doc)
print("Saved transcription and embedding to Firestore!")