'use client';

interface FetchOptions extends RequestInit {
  withAuth?: boolean;
}

/**
 * Utility function for making API calls with authentication
 * @param url The URL to fetch
 * @param options Request options including whether to use authentication
 * @returns Promise with response data
 */
export async function apiFetch<T = any>(
  url: string, 
  options: FetchOptions = {}
): Promise<T> {
  const { withAuth = true, ...fetchOptions } = options;
  
  // Get the auth token from localStorage if needed
  let headers: HeadersInit = { 
    ...options.headers,
    'Content-Type': 'application/json',
  };

  // Add auth token if required and available
  if (withAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers = {
        ...headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }

  // Make the fetch request
  const response = await fetch(url, {
    ...fetchOptions,
    headers
  });

  // Parse the JSON response
  const data = await response.json();
  
  // If the response was not successful, throw an error
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
}
