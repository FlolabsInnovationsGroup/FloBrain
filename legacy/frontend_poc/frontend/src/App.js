import React, { useState, useEffect, useCallback } from 'react';
import MediaUpload from './MediaUpload';
import MediaList from './MediaList';
import './App.css';

const mockApiData = [
  {
    id: 'owned_image_1',
    name: 'mountain_trip.jpg',
    type: 'image',
    createdAt: '2023-10-28T10:00:00Z',
    thumbnailUrl: 'https://picsum.photos/id/10/200/100',
    aiSummary: 'Simulated transcription: "Photo of a snowy mountain under a blue sky. The composition is centered on the main peak, with trees visible in the foreground."'
  },
  {
    id: 'owned_audio_1',
    name: 'final_podcast_episode.mp3',
    type: 'audio',
    createdAt: '2023-10-26T15:30:00Z',
    thumbnailUrl: null,
    fileUrl: 'https://file-examples.com/storage/fe52cb0c4862dc676a1b341/2017/11/file_example_MP3_700KB.mp3',
    aiSummary: 'Simulated transcription: "Hello and welcome to this final episode. Today, we will talk about the future of technology and artificial intelligence..."'
  },
  {
    id: 'owned_image_2',
    name: 'company_logo.png',
    type: 'image',
    createdAt: '2023-11-01T12:00:00Z',
    thumbnailUrl: 'https://picsum.photos/id/20/200/100',
    aiSummary: 'Simulated transcription: "Image of a logo with geometric shapes. The dominant colors are blue and white."'
  },
];

function App() {
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchMedia = useCallback(async (isInitialLoad = false) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isInitialLoad) {
        setMediaList(mockApiData);
      } else {
        const newFile = {
          id: Date.now(),
          name: `new_file_${Date.now()}.jpg`,
          type: 'image',
          createdAt: new Date().toISOString(),
          thumbnailUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/200/100`,
          aiSummary: 'Simulated transcription for the newly uploaded file. Processing was successful.'
        };
        setMediaList(prevList => [newFile, ...prevList]);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia(true);
  }, [fetchMedia]);

  const handleDelete = (mediaId) => {
    setMediaList(prevList => prevList.filter(media => media.id !== mediaId));
  };

  const handleEdit = (mediaId, newName) => {
    setMediaList(prevList =>
      prevList.map(media =>
        media.id === mediaId ? { ...media, name: newName } : media
      )
    );
  };

  const filteredMedia = mediaList.filter(media => {
    const typeMatch = filterType ? media.type === filterType : true;
    const dateMatch = filterDate ? new Date(media.createdAt) >= new Date(filterDate) : true;
    return typeMatch && dateMatch;
  });

  return (
    <div className="App" style={{ padding: '30px' }}>
      <h1>Media Management</h1>
      <MediaUpload onUploadSuccess={fetchMedia} />
      <MediaList
        mediaList={filteredMedia}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={handleEdit}
        filterType={filterType}
        setFilterType={setFilterType}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
      />
    </div>
  );
}

export default App;