import React, { useState, useRef } from 'react';
import { uploadMedia } from './mediaService';

function MediaUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('pending');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
      setUploadStatus('pending');
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setError(null);
    setUploadStatus('pending');

    const progressCallback = (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setUploadProgress(percent);
    };

    try {
      await uploadMedia(selectedFile, progressCallback);
      setUploadStatus('processed');
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      setUploadStatus('error');
    } finally {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
      <h2>Upload Media</h2>
      <input type="file" onChange={handleFileChange} ref={fileInputRef} />
      <button onClick={handleUpload} disabled={!selectedFile}>Upload</button>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      {selectedFile && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ backgroundColor: '#e0e0e0', borderRadius: '4px', width: '100%', height: '20px' }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              borderRadius: '4px',
              backgroundColor: uploadStatus === 'processed' ? '#4caf50' : '#2196f3',
              transition: 'width 0.4s ease-in-out'
            }}></div>
          </div>
          <p>
            Status:{' '}
            <span style={{ color: uploadStatus === 'processed' ? '#4caf50' : 'black', fontWeight: 'bold' }}>
              {uploadStatus}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default MediaUpload;