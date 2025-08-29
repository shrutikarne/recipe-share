/**
 * uploads.js
 * Functions for handling file uploads
 */

import API from './api';
import { handleApiError } from '../utils/ErrorHandler';

/**
 * Upload a recipe image
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} Promise resolving to the URL of the uploaded image
 */
export const uploadRecipeImage = async (imageFile) => {
  try {
    // Create form data object
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Set content type to multipart/form-data
    const uploadConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const response = await API.post('/uploads/recipe-image', formData, uploadConfig);
    
    if (response.data && response.data.success && response.data.imageUrl) {
      return response.data.imageUrl;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    handleApiError(error, 'Error uploading recipe image');
    throw error;
  }
};

// Create a named export object
const uploadApi = {
  uploadRecipeImage
};

export default uploadApi;
