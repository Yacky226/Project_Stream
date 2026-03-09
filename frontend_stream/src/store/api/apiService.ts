import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query configuration
const createBaseQuery = () => fetchBaseQuery({
  baseUrl: process.env.NODE_ENV === 'production' 
    ? '/api/v1' 
    : 'http://localhost:8080/api/v1',
  
  prepareHeaders: (headers, { getState }) => {
    // Get token from state if available
    const state = getState() as any;
    const token = state?.auth?.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('content-type', 'application/json');
    headers.set('accept', 'application/json');
    
    return headers;
  },
});

// Enhanced base query with retry logic
const baseQueryWithRetry = async (args: any, api: any, extraOptions: any) => {
  const baseQuery = createBaseQuery();
  const maxRetries = extraOptions?.maxRetries || 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const result = await baseQuery(args, api, extraOptions);
      
      if (result.error) {
        // Don't retry on authentication errors
        if (result.error.status === 401 || result.error.status === 403) {
          return result;
        }
        
        // Don't retry on client errors (4xx except 401/403)
        if (result.error.status >= 400 && result.error.status < 500) {
          return result;
        }
        
        // Retry on server errors (5xx) and network errors
        if (attempt < maxRetries - 1) {
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          continue;
        }
      }
      
      return result;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      throw error;
    }
  }
};

// Create the main API service
export const apiService = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    'User',
    'Course',
    'Lesson',
    'StreamingSession',
    'ChatMessage',
    'Notification',
    'Progress',
    'Rating',
    'Bookmark',
  ],
  endpoints: () => ({}),
});

export default apiService;