# tests/test_whisper_service.py
import pytest
from unittest.mock import MagicMock
from services import whisper_service # Import the module itself
import openai
from tenacity import RetryError

# --- Tests for the public 'transcribe_batch' wrapper function ---

def test_transcribe_batch_success(mocker):
    """Tests the public wrapper's success path."""
    mock_internal = mocker.patch(
        'services.whisper_service._transcribe_batch_internal',
        return_value=[{'text': 'Success'}]
    )
    result = whisper_service.transcribe_batch("dummy/path.wav")
    mock_internal.assert_called_once_with("dummy/path.wav")
    assert result[0]['text'] == 'Success'

def test_transcribe_batch_handles_retry_failure(mocker):
    """Tests the public wrapper catching the final RetryError."""
    mocker.patch(
        'services.whisper_service._transcribe_batch_internal',
        side_effect=RetryError("Mocked retry failure")
    )
    result = whisper_service.transcribe_batch("dummy/path.wav")
    assert result == []

def test_transcribe_batch_handles_file_not_found(mocker):
    """Tests the public wrapper catching FileNotFoundError."""
    mocker.patch(
        'services.whisper_service._transcribe_batch_internal',
        side_effect=FileNotFoundError("Mocked file not found")
    )
    result = whisper_service.transcribe_batch("dummy/path.wav")
    assert result == []

def test_transcribe_batch_handles_generic_exception(mocker):
    """Tests the public wrapper catching a generic Exception."""
    mocker.patch(
        'services.whisper_service._transcribe_batch_internal',
        side_effect=Exception("A generic error")
    )
    result = whisper_service.transcribe_batch("dummy/path.wav")
    assert result == []


# --- Tests for the internal '_transcribe_batch_internal' function ---

def test_internal_batch_success_and_normalization(mocker):
    """
    COVERS THE BIGGEST GAP: Tests the entire success path of the internal function.
    """
    mock_client = MagicMock()
    mocker.patch('services.whisper_service.client', mock_client)
    mocker.patch('builtins.open', mocker.mock_open(read_data=b'bytes'))
    
    mock_api_response = MagicMock()
    mock_segment = MagicMock()
    mock_segment.start, mock_segment.end, mock_segment.text = 0.0, 4.0, 'It works.'
    mock_api_response.segments = [mock_segment]
    mock_client.audio.transcriptions.create.return_value = mock_api_response
    
    result = whisper_service._transcribe_batch_internal("dummy/path.wav")
    
    mock_client.audio.transcriptions.create.assert_called_once()
    assert len(result) == 1
    assert result[0]['text'] == 'It works.'

def test_internal_batch_retries_on_api_error(mocker):
    """Proves that the @retry decorator works on the internal function."""
    mock_client = MagicMock()
    mocker.patch('services.whisper_service.client', mock_client)
    mocker.patch('builtins.open', mocker.mock_open(read_data=b'bytes'))

    mock_http_response = MagicMock()
    mock_http_response.request = MagicMock()
    mock_client.audio.transcriptions.create.side_effect = openai.RateLimitError(
        "Simulated error", response=mock_http_response, body=None
    )
    
    with pytest.raises(RetryError):
        whisper_service._transcribe_batch_internal("dummy/path.wav")
    
    assert mock_client.audio.transcriptions.create.call_count == 3


# --- Tests for 'transcribe_stream' and helpers ---

def test_transcribe_stream_prints_results(mocker):
    """
    COVERS A KEY GAP: Tests the 'if segments:' block in transcribe_stream.
    """
    mocker.patch('services.whisper_service.sd')
    mocker.patch('services.whisper_service.TemporaryAudioFile')
    mock_logger = mocker.patch('services.whisper_service.logging')
    
    class StopTestLoop(Exception): pass
    mocker.patch(
        'services.whisper_service.transcribe_batch',
        side_effect=[
            [{"start": 0.0, "end": 2.0, "text": "Test transcript"}],
            StopTestLoop
        ]
    )

    with pytest.raises(StopTestLoop):
        whisper_service.transcribe_stream()
        
    mock_logger.info.assert_any_call("[0.00s - 2.00s] Test transcript")

def test_transcribe_stream_handles_no_results(mocker):
    """Tests the 'else' block for empty segments in transcribe_stream."""
    mocker.patch('services.whisper_service.sd')
    mocker.patch('services.whisper_service.TemporaryAudioFile')
    mock_logger = mocker.patch('services.whisper_service.logging')

    class StopTestLoop(Exception): pass
    mocker.patch(
        'services.whisper_service.transcribe_batch',
        side_effect=[
            [], # First call returns an empty list
            StopTestLoop
        ]
    )

    with pytest.raises(StopTestLoop):
        whisper_service.transcribe_stream()
        
    mock_logger.info.assert_any_call("No transcription returned for the last chunk.")

def test_temporary_audio_file_cleanup_error(mocker):
    """
    COVERS A FINAL GAP: Tests the 'except OSError' in the cleanup class.
    """
    mocker.patch('services.whisper_service.os.remove', side_effect=OSError("Permission denied"))
    mocker.patch('services.whisper_service.wav.write')
    
    # Use the context manager and expect it to run without crashing.
    from services.whisper_service import TemporaryAudioFile
    with TemporaryAudioFile(16000, b'data') as temp_path:
        pass # The error is raised and handled on exit