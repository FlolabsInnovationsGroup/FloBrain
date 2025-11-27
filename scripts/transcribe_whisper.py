import whisper

model = whisper.load_model("large")  
result = model.transcribe("output.wav")
print("Transcription:", result["text"])