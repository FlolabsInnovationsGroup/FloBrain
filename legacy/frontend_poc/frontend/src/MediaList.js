import React from 'react';
import MediaItem from './MediaItem';

function MediaList({ mediaList, isLoading, onDelete, onEdit, filterType, setFilterType, filterDate, setFilterDate }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Media List</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div>
            <label htmlFor="type-filter" style={{ marginRight: '5px' }}>Filter by type:</label>
            <select
              id="type-filter"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">All</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
            </select>
          </div>
          <div>
            <label htmlFor="date-filter" style={{ marginRight: '5px' }}>Show after:</label>
            <input
              type="date"
              id="date-filter"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <p>Loading media...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {mediaList.map(media => (
            <MediaItem key={media.id} media={media} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default MediaList;