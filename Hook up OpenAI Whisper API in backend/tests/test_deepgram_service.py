# tests/test_deepgram_service.py 

import pytest
from unittest.mock import MagicMock
from services.deepgram_service import transcribe_live
from deepgram import LiveTranscriptionEvents # Import the events for our test

# --- Test Suite for the Deepgram Live Transcription Service ---

@pytest.fixture
def mock_dependencies(mocker):
    """A single fixture to mock all external dependencies for the service."""
    # Mock the Deepgram client and its connection object
    mock_deepgram_client = MagicMock()
    mock_dg_connection = MagicMock()
    mock_deepgram_client.listen.websocket.v.return_value = mock_dg_connection
    mocker.patch('services.deepgram_service.DeepgramClient', return_value=mock_deepgram_client)
    
    # Mock the Microphone class
    mocker.patch('services.deepgram_service.Microphone')
    
    # Mock the 'input' function to prevent the test from blocking
    mocker.patch('builtins.input', return_value=None)
    
    # Mock the logging and sys modules to capture output
    mock_logging = mocker.patch('services.deepgram_service.logging')
    mock_sys = mocker.patch('services.deepgram_service.sys')
    
    # Return all mocks in a dictionary for easy access in tests
    return {
        "mock_dg_connection": mock_dg_connection,
        "mock_logging": mock_logging,
        "mock_sys": mock_sys
    }


def test_transcribe_live_initializes_and_runs(mock_dependencies):
    """
    Tests that the main function initializes all components and runs without crashing.
    This covers the main execution path.
    """
    # Call the function we are testing
    transcribe_live()
    
    # Assert that the main components were set up and shut down correctly
    mock_dependencies["mock_dg_connection"].start.assert_called_once()
    mock_dependencies["mock_dg_connection"].finish.assert_called_once()


def test_on_message_handler_prints_correctly(mock_dependencies):
    """
    Tests the logic inside the 'on_message' event handler.
    This specifically covers the transcript processing and printing logic.
    """
    event_handlers = {}
    
    # Use a side effect to capture the functions passed to the .on() method
    def capture_handler(event, func):
        event_handlers[event] = func
    
    mock_dependencies["mock_dg_connection"].on.side_effect = capture_handler
    
    # Run the main function to register the handlers
    transcribe_live()
    
    # --- Simulate a final transcript message from Deepgram ---
    mock_word1 = MagicMock()
    mock_word1.start, mock_word1.end, mock_word1.punctuated_word = 1.0, 1.5, "Hello"
    
    mock_word2 = MagicMock()
    mock_word2.start, mock_word2.end, mock_word2.punctuated_word = 1.6, 2.0, "world."

    mock_result = MagicMock()
    mock_result.speech_final = True
    mock_result.channel.alternatives[0].transcript = "Hello world."
    mock_result.channel.alternatives[0].words = [mock_word1, mock_word2]

    # Manually call the captured 'on_message' handler with our mock data
    on_message_handler = event_handlers[LiveTranscriptionEvents.Transcript]
    on_message_handler(None, mock_result) # 'self' can be None for the test
    
    # Assert that the logger was called with the correctly formatted final segment
    mock_dependencies["mock_logging"].info.assert_any_call("[1.00s -> 2.00s] Hello world.")


def test_on_error_handler_logs_error(mock_dependencies):
    """
    Tests the logic inside the 'on_error' event handler.
    """
    event_handlers = {}
    def capture_handler(event, func):
        event_handlers[event] = func
    
    mock_dependencies["mock_dg_connection"].on.side_effect = capture_handler
    
    transcribe_live()
    
    # Simulate an error event from Deepgram
    mock_error_data = {"type": "Exception", "description": "A test error"}
    
    # Manually call the captured 'on_error' handler
    on_error_handler = event_handlers[LiveTranscriptionEvents.Error]
    on_error_handler(None, mock_error_data)
    
    # Assert that the error was logged correctly
    mock_dependencies["mock_logging"].error.assert_any_call(f"❌ An error occurred: {mock_error_data}")

# Add this new test to the end of tests/test_deepgram_service.py

def test_on_message_handler_interim_result(mock_dependencies):
    """
    Tests that the on_message handler correctly prints interim results.
    """
    event_handlers = {}
    def capture_handler(event, func):
        event_handlers[event] = func
    
    mock_dependencies["mock_dg_connection"].on.side_effect = capture_handler
    
    transcribe_live()
    
    # --- Simulate an INTERIM transcript message ---
    mock_result = MagicMock()
    mock_result.speech_final = False # This is an interim result
    mock_result.channel.alternatives[0].transcript = "This is an interim result"

    # Manually call the captured 'on_message' handler
    on_message_handler = event_handlers[LiveTranscriptionEvents.Transcript]
    on_message_handler(None, mock_result)
    
    # Assert that sys.stdout.write was called with the interim text
    mock_dependencies["mock_sys"].stdout.write.assert_any_call("Live: This is an interim result\r")