import axios from 'axios';

const API_URL = '/api/media';

// --- SERVICE FUNCTIONS ---

export const uploadMedia = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('mediaFile', file);

  // SIMULATION: Simulate a successful upload with progress.
  // return new Promise((resolve) => {
  //   let progress = 0;
  //   const interval = setInterval(() => {
  //     progress += 25;
  //     if (onUploadProgress) {
  //       onUploadProgress({ loaded: progress, total: 100 });
  //     }
  //     if (progress >= 100) {
  //       clearInterval(interval);
  //       resolve({ data: { message: 'Upload successful' } });
  //     }
  //   }, 200);
  // });

  // REAL IMPLEMENTATION:
  
  return axios.post(`${API_URL}/upload`, formData, {
    onUploadProgress: progressEvent => {
      if (onUploadProgress) {
        onUploadProgress({ loaded: progressEvent.loaded, total: progressEvent.total });
      }
    }
  });
  
};

export const getAllMedia = () => {
  // REAL IMPLEMENTATION:
  return axios.get(`${API_URL}/all`);
};

export const deleteMedia = (id) => {
  // REAL IMPLEMENTATION: 
  return axios.delete(`${API_URL}/${id}`);
};

export const updateMedia = (id, data) => {
  // REAL IMPLEMENTATION: 
  return axios.patch(`${API_URL}/${id}`, data);
};