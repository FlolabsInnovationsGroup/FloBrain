"""
test_sound_recorder.py
# This script records audio from the microphone and saves it as a WAV file.
# It uses the sounddevice library for recording and scipy for saving the audio file.

Requirements:
# - sounddevice
# - scipy

Usage:
# 1. Install the required packages:
#    ```bash    
#    pip install sounddevice scipy
#    ```
# 2. Run the script:    
#    ```bash
#    python test_sound_recorder.py
#    ```

Author: Samudra Gargo Bhattacharya
# Date: 2023-10-01
"""
import sounddevice as sd
from scipy.io.wavfile import write

fs = 16000  # Sample rate
seconds = 5  # Duration of recording

print("🎤 Recording...")
recording = sd.rec(int(seconds * fs), samplerate=fs, channels=1, dtype='int16')
sd.wait()  # Wait until recording is finished
write("my_recording.wav", fs, recording)
print("✅ Saved as my_recording.wav") 