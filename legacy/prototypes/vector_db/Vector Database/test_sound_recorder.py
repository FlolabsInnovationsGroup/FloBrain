import sounddevice as sd
from scipy.io.wavfile import write

fs = 16000  # Sample rate
seconds = 10  # Duration of recording

print("🎤 Recording...")
recording = sd.rec(int(seconds * fs), samplerate=fs, channels=1, dtype='int16')
sd.wait()  # Wait until recording is finished
write("my_recording.wav", fs, recording)
print("✅ Saved as my_recording.wav")