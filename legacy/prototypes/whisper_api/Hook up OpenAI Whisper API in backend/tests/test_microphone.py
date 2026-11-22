# tests/test_microphone.py 

import pytest
from unittest.mock import MagicMock
import time
from services.deepgram_service import Microphone

@pytest.fixture
def mock_pyaudio(mocker):
    """Mocks the entire pyaudio library."""
    mock_stream = MagicMock()
    mock_pyaudio_instance = MagicMock()
    mock_pyaudio_instance.open.return_value = mock_stream
    
    mocker.patch('services.deepgram_service.pyaudio.PyAudio', return_value=mock_pyaudio_instance)
    return mock_pyaudio_instance, mock_stream

def test_microphone_initialization(mock_pyaudio):
    """Tests that the Microphone class initializes correctly."""
    mock_pyaudio_instance, mock_stream = mock_pyaudio
    mock_dg_connection = MagicMock()
    
    mic = Microphone(mock_dg_connection)
    
    # Was the pyaudio library initialized?
    mock_pyaudio_instance.open.assert_called_once()
    # Did the microphone thread start?
    assert mic.thread.is_alive()
    
    mic.close() # Clean up the thread

def test_microphone_thread_sends_data(mock_pyaudio):
    """Tests that the microphone thread reads from the stream and sends data."""
    mock_pyaudio_instance, mock_stream = mock_pyaudio
    mock_dg_connection = MagicMock()
    
    # Configure the mock stream to return fake audio data
    mock_stream.read.return_value = b'fake_audio_data'
    
    mic = Microphone(mock_dg_connection)
    
    # Give the thread a moment to run
    time.sleep(0.1) 
    
    # Assert that the data read from the stream was sent to Deepgram
    mock_dg_connection.send.assert_called_with(b'fake_audio_data')
    
    mic.close()

def test_microphone_close_cleans_up(mock_pyaudio):
    """Tests that the close method correctly shuts down all resources."""
    mock_pyaudio_instance, mock_stream = mock_pyaudio
    mock_dg_connection = MagicMock()
    
    mic = Microphone(mock_dg_connection)
    
    # Call the close method
    mic.close()
    
    # Assert that all cleanup methods were called
    assert mic.is_exiting() is True
    mock_stream.stop_stream.assert_called_once()
    mock_stream.close.assert_called_once()
    mock_pyaudio_instance.terminate.assert_called_once()