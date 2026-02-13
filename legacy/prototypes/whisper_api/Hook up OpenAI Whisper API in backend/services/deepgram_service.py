# services/deepgram_service.py

import threading
import pyaudio
import logging
import sys # <-- Import the sys module
from deepgram import (
    DeepgramClient,
    LiveTranscriptionEvents,
    LiveOptions,
)

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
        logging.info("🎤 Microphone closed.")

def transcribe_live():
    """The main function to set up and run the Deepgram transcription."""
    microphone = None
    dg_connection = None
    
    try:
        deepgram = DeepgramClient()
        dg_connection = deepgram.listen.websocket.v("1")

        def on_open(self, open, **kwargs):
            logging.info(f"✅ Connection Open. Speak now...")

        def on_message(self, result, **kwargs):
            sentence = result.channel.alternatives[0].transcript
            
            # ===================================================================
            # THE FIX IS HERE: Use sys.stdout for overwriting the line
            # ===================================================================
            if not result.speech_final and len(sentence.strip()) > 0:
                sys.stdout.write(f"Live: {sentence}\r")
                sys.stdout.flush()

            if result.speech_final:
                words = result.channel.alternatives[0].words
                if not words: return
                
                # Clear the "Live:" line before printing the final segment
                sys.stdout.write("\033[K")
                sys.stdout.flush()
                
                full_sentence = " ".join([word.punctuated_word for word in words])
                start_s = words[0].start
                end_s = words[-1].end
                
                # Use logging for the final, permanent output
                logging.info(f"[{start_s:.2f}s -> {end_s:.2f}s] {full_sentence}")
            # ===================================================================

        def on_error(self, error, **kwargs):
            logging.error(f"❌ An error occurred: {error}")

        dg_connection.on(LiveTranscriptionEvents.Open, on_open)
        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)
        dg_connection.on(LiveTranscriptionEvents.Error, on_error)

        options = LiveOptions(
            model="nova-2", language="en-US", smart_format=True,
            interim_results=True, endpointing=True,
            encoding="linear16", sample_rate=16000, channels=1
        )

        logging.info("🔌 Connecting to Deepgram...")
        if dg_connection.start(options) is False:
             logging.error("Failed to start connection.")
             return

        microphone = Microphone(dg_connection)
        input("🔴 Press Enter to stop...\n")

    except Exception as e:
        logging.error(f"❗ Unhandled exception: {type(e).__name__}: {e}", exc_info=True)
    finally:
        if microphone:
            microphone.close()
        if dg_connection:
            dg_connection.finish()
            logging.info("✅ Deepgram session ended.")