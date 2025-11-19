import React, { useState } from 'react';

function MediaItem({ media, onDelete, onEdit }) {
  const [showSummary, setShowSummary] = useState(false);

  const handleEditClick = () => {
    const newName = prompt("Enter the new file name:", media.name);
    if (newName && newName.trim() !== '') {
      onEdit(media.id, newName);
    }
  };

  return (
    <li style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: '15px',
      borderBottom: '1px solid #eee'
    }}>
      {/* Preview Column */}
      <div style={{ marginRight: '15px', width: '150px', flexShrink: 0 }}>
        {media.type === 'image' && media.thumbnailUrl ? (
          <img src={media.thumbnailUrl} alt={media.name} style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
        ) : media.type === 'audio' ? (
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Audio</p>
            <audio controls style={{ width: '100%' }}>
              <source src={media.fileUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : (
          <div style={{
            width: '150px', height: '80px', backgroundColor: '#f0f0f0', display: 'flex',
            alignItems: 'center', justifyContent: 'center', borderRadius: '4px'
          }}>
            <span>{media.type}</span>
          </div>
        )}
      </div>

      {/* Info Column */}
      <div style={{ flexGrow: 1 }}>
        <h4 style={{ margin: '0 0 10px 0' }}>{media.name}</h4>
        <div>
          <button onClick={() => setShowSummary(!showSummary)}>
            {showSummary ? 'Hide' : 'Show'} AI Summary
          </button>
          {showSummary && (
            <div style={{
              marginTop: '10px', padding: '10px', backgroundColor: '#fafafa',
              border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.9em'
            }}>
              <p>{media.aiSummary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions Column */}
      <div style={{ marginLeft: '15px' }}>
        <button onClick={handleEditClick}>Edit</button>
        <button
          style={{ marginLeft: '5px' }}
          onClick={() => onDelete(media.id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default MediaItem;