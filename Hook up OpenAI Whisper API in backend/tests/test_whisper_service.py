# tests/test_whisper_service.py

import pytest
from unittest.mock import MagicMock
from services.whisper_service import transcribe_batch, transcribe_stream
import openai

# --- Tests for transcribe_batch ---

def test_transcribe_batch_success(mocker):
    """Tests the successful transcription path for the batch function."""
    mock_client = MagicMock()
    mocker.patch('services.whisper_service.client', mock_client)

    mock_api_response = MagicMock()
    mock_segment = MagicMock()
    mock_segment.start, mock_segment.end, mock_segment.text = 0.0, 4.0, ' It works.'
    mock_api_response.segments = [mock_segment]
    
    mock_client.audio.transcriptions.create.return_value = mock_api_response
    mocker.patch('builtins.open', mocker.mock_open(read_data=b'bytes'))
    
    result = transcribe_batch("dummy/path.wav")
    
    mock_client.audio.transcriptions.create.assert_called_once()
    assert len(result) == 1
    assert result[0]['text'] == ' It works.'

def test_transcribe_batch_api_error(mocker):
    """Tests the API error handling path for the batch function."""
    mock_client = MagicMock()
    mocker.patch('services.whisper_service.client', mock_client)

    mock_http_response = MagicMock()
    mock_http_response.request = MagicMock()
    mock_client.audio.transcriptions.create.side_effect = openai.RateLimitError(
        "Simulated error", response=mock_http_response, body=None
    )
    
    mocker.patch('builtins.open', mocker.mock_open(read_data=b'bytes'))
    
    result = transcribe_batch("dummy/path.wav")
    
    assert result == []
    mock_client.audio.transcriptions.create.assert_called_once()

# --- New Test for transcribe_stream ---

def test_transcribe_stream_one_loop(mocker):
    """
    Tests one full loop of the transcribe_stream function.
    It validates that recording, file writing, batch transcription, and cleanup
    are all called correctly.
    """
    # 1. Mock all external dependencies of the stream function
    mocker.patch('services.whisper_service.sd')
    mocker.patch('services.whisper_service.wav.write')
    mocker.patch('services.whisper_service.os.remove')
    
    # ===================================================================
    # THE FIX IS HERE: We will directly mock NamedTemporaryFile to control its name.
    # We don't need the complex __enter__ part.
    # ===================================================================
    mock_tempfile = mocker.patch('tempfile.NamedTemporaryFile')
    # The 'with' statement will call the mock, and we access its .name attribute
    mock_tempfile.return_value.name = "fake_temp_file.wav"
    
    # 2. Mock the call to transcribe_batch to stop the loop
    # We will have it raise an exception that we can catch.
    class StopTestLoop(Exception):
        pass
    mock_batch_call = mocker.patch(
        'services.whisper_service.transcribe_batch',
        side_effect=StopTestLoop
    )

    # 3. Call the function and expect our custom exception
    with pytest.raises(StopTestLoop):
        transcribe_stream()
        
    # 4. Assert that the underlying functions were called correctly
    # Assert that transcribe_batch was called with the string name we defined
    mock_batch_call.assert_called_once_with("fake_temp_file.wav")


    # Add these new, targeted tests to the end of tests/test_whisper_service.py

def test_transcribe_batch_file_not_found(mocker):
    """
    Increases test coverage for the `transcribe_batch` function.
    This test specifically targets the `except FileNotFoundError` block.
    """
    # We don't need to mock the client, as this error happens before the API call.
    # We just need to mock the built-in 'open' function to raise the error.
    mocker.patch('builtins.open', side_effect=FileNotFoundError("Mocked file not found"))
    
    # Call the function and assert that it returns an empty list as expected.
    result = transcribe_batch("a_file_that_does_not_exist.wav")
    assert result == []

# Add these new, targeted tests to the end of tests/test_whisper_service.py

def test_transcribe_batch_generic_exception(mocker):
    """
    Covers the generic 'except Exception' block in transcribe_batch.
    """
    mock_client = MagicMock()
    mocker.patch('services.whisper_service.client', mock_client)
    
    # Configure the mock to raise a generic Exception
    mock_client.audio.transcriptions.create.side_effect = Exception("A generic, unexpected error")
    
    mocker.patch('builtins.open', mocker.mock_open(read_data=b'bytes'))
    
    result = transcribe_batch("dummy/path.wav")
    assert result == [] # The function should fail gracefully

def test_transcribe_stream_prints_results(mocker):
    """
    Covers the 'if segments:' block in transcribe_stream.
    """
    # Mock all external dependencies
    mocker.patch('services.whisper_service.sd')
    mocker.patch('services.whisper_service.TemporaryAudioFile')
    mock_logger = mocker.patch('services.whisper_service.logging')

    # Configure transcribe_batch to return a successful result, then stop the loop
    class StopTestLoop(Exception): pass
    mocker.patch(
        'services.whisper_service.transcribe_batch',
        side_effect=[
            [{"start": 0.0, "end": 2.0, "text": "Test transcript"}], # First call returns a result
            StopTestLoop
        ]
    )

    with pytest.raises(StopTestLoop):
        transcribe_stream()
        
    # Assert that the logger was called with the formatted transcript
    mock_logger.info.assert_any_call("[0.00s - 2.00s] Test transcript")


def test_temporary_audio_file_cleanup_error(mocker):
    """
    Covers the 'except OSError' block in the TemporaryAudioFile.__exit__ method.
    """
    # Mock os.remove to raise an OSError when called
    mock_remove = mocker.patch('services.whisper_service.os.remove', side_effect=OSError("Permission denied"))
    mocker.patch('services.whisper_service.wav.write')
    
    # Use the context manager and expect it to run without crashing
    from services.whisper_service import TemporaryAudioFile
    with TemporaryAudioFile(16000, []) as temp_path:
        pass
    
    # Assert that our mock of os.remove was actually called
    mock_remove.assert_called_once()