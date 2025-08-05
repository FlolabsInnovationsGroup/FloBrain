# live_stream_final_v4.py

import threading
import pyaudio
from dotenv import load_dotenv
from deepgram import (
    DeepgramClient,
    LiveTranscriptionEvents,
    LiveOptions,
)

load_dotenv()

class Microphone:
    """A class to manage the microphone stream using a separate thread."""
    def __init__(self, dg_connection):
        self.dg_connection = dg_connection
        self.pyaudio_instance = pyaudio.PyAudio()
        self.stream = self.pyaudio_instance.open(
            format=pyaudio.paInt16, channels=1, rate=16000,
            input=True, frames_per_buffer=1024,
        )
        self.lock = threading.Lock()
        self.exit = False
        self.thread = threading.Thread(target=self.microphone_thread)
        self.thread.start()

    def microphone_thread(self):
        """The thread that reads audio from the microphone and sends it to Deepgram."""
        while not self.is_exiting():
            try:
                data = self.stream.read(1024)
                self.dg_connection.send(data)
            except (IOError, OSError):
                break

    def is_exiting(self):
        with self.lock:
            return self.exit

    def signal_exit(self):
        with self.lock:
            self.exit = True

    def close(self):
        self.signal_exit()
        self.thread.join()
        if self.stream.is_active():
            self.stream.stop_stream()
        self.stream.close()
        self.pyaudio_instance.terminate()
        print("🎤 Microphone closed.")

def main():
    """The main function to set up and run the transcription."""
    microphone = None
    dg_connection = None
    
    try:
        deepgram = DeepgramClient()
        dg_connection = deepgram.listen.websocket.v("1")

        def on_open(self, open, **kwargs):
            print(f"\n✅ Connection Open. Speak now...\n")

        def on_message(self, result, **kwargs):
            # Extract the transcript from the message
            sentence = result.channel.alternatives[0].transcript
            
            # Print the live, interim transcript
            if not result.speech_final and len(sentence.strip()) > 0:
                print(f"Live: {sentence}", end='\r')

            # ===================================================================
            # THE FIX IS HERE: Only process the final message for segmentation
            # ===================================================================
            if result.speech_final:
                # Get the word list from this final message
                words = result.channel.alternatives[0].words
                
                if not words:
                    return

                # Create the final sentence from the punctuated words
                full_sentence = " ".join([word.punctuated_word for word in words])
                
                # Get the start and end times from the word list
                start_s = words[0].start
                end_s = words[-1].end
                
                # Clear the "Live:" line before printing the final segment
                print("\033[K", end='')
                print(f"[{start_s:.2f}s -> {end_s:.2f}s] {full_sentence}")

        def on_error(self, error, **kwargs):
            print(f"\n❌ An error occurred: {error}\n")

        dg_connection.on(LiveTranscriptionEvents.Open, on_open)
        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
        dg_connection.on(LiveTranscriptionEvents.Error, on_error)

        options = LiveOptions(
            model="nova-2", language="en-US", smart_format=True,
            interim_results=True,
            endpointing=True,
            encoding="linear16", sample_rate=16000, channels=1
        )

        print("🔌 Connecting to Deepgram...")
        if dg_connection.start(options) is False:
             print("Failed to start connection.")
             return

        microphone = Microphone(dg_connection)
        input("🔴 Press Enter to stop...\n")

    except Exception as e:
        print(f"\n❗ Unhandled exception: {type(e).__name__}: {e}")
    finally:
        if microphone:
            microphone.close()
        if dg_connection:
            dg_connection.finish()
            print("✅ Deepgram session ended.")

if __name__ == "__main__":
    main()