import axios from 'axios';

const API_URL = '/api/v1/ai';

// --- SERVICE FUNCTIONS ---

export const processMedia = (mediaId) => {
  // This is the call that backend understands for now.
  return axios.post(`${API_URL}/process/${mediaId}`);
};

export const uploadMedia = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('mediaFile', file);

  // SIMULATION: Simulate a successful upload with progress.
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (onUploadProgress) {
        onUploadProgress({ loaded: progress, total: 100 });
      }
      if (progress >= 100) {
        clearInterval(interval);
        resolve({ data: { message: 'Simulation Upload successful' } });
      }
    }, 200);
  });

  // REAL IMPLEMENTATION:
  
//   return axios.post(`${API_URL}/upload`, formData, {
//     onUploadProgress: progressEvent => {
//       if (onUploadProgress) {
//         onUploadProgress({ loaded: progressEvent.loaded, total: progressEvent.total });
//       }
//     }
//   });
  
};

export const getAllMedia = () => {
  // REAL IMPLEMENTATION: 
  return axios.get(`${API_URL}/all`);
  //console.log("SERVICE: Calling getAllMedia (will be a real API call)");
};

export const deleteMedia = (id) => {
  // REAL IMPLEMENTATION: 
  return axios.delete(`${API_URL}/${id}`);
  //console.log(`SERVICE: Calling deleteMedia for ID ${id} (will be a real API call)`);
};

export const updateMedia = (id, data) => {
  // REAL IMPLEMENTATION: 
  return axios.patch(`${API_URL}/${id}`, data);
  //console.log(`SERVICE: Calling updateMedia for ID ${id} with data`, data, '(will be a real API call)');
};