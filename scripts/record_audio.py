import sounddevice as sd
from scipy.io.wavfile import write

fs = 16000  # Sample rate
seconds = 5  # Duration of recording

print("Recording...")
audio = sd.rec(int(seconds * fs), samplerate=fs, channels=1)
sd.wait()  # Wait until recording is finished
write('output.wav', fs, audio)
print("Saved as output.wav")