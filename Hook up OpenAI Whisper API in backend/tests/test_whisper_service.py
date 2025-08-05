# tests/test_whisper_service.py (Complete with stream test)

import pytest
from unittest.mock import MagicMock, patch
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
    """
    mock_sd = mocker.patch('services.whisper_service.sd')
    mock_wav_write = mocker.patch('services.whisper_service.wav.write')
    mock_os_remove = mocker.patch('services.whisper_service.os.remove')
    
    mock_temp_file = MagicMock()
    mock_temp_file.name = "fake_temp_file.wav"
    mocker.patch('tempfile.NamedTemporaryFile').return_value.__enter__.return_value = mock_temp_file

    # We will let transcribe_batch run once, then raise the exception
    # to simulate the user pressing Ctrl+C.
    mock_batch_call = mocker.patch(
        'services.whisper_service.transcribe_batch',
        side_effect=[None, KeyboardInterrupt("Stopping loop for test")] 
        # First call returns None, second call (which won't be reached in this flow) would raise.
        # Let's change this.
    )

    # Let's use a simpler side effect for the test
    # We will raise a custom exception to break the loop cleanly.
    class StopTestLoop(Exception):
        pass

    mock_batch_call.side_effect = StopTestLoop

    # We expect our custom exception to be raised, so we wrap the call
    with pytest.raises(StopTestLoop):
        transcribe_stream()
        
    # Now, we can assert what happened *before* the exception was raised.
    mock_sd.rec.assert_called_once()
    mock_sd.wait.assert_called_once()
    mock_wav_write.assert_called_once()
    mock_batch_call.assert_called_once_with("fake_temp_file.wav")
    
    # Since the StopTestLoop exception happens *before* os.remove,
    # we now correctly expect it NOT to be called in this test scenario.
    mock_os_remove.assert_not_called()