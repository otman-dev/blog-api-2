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
  }  // Add timeout to fetch request (30 seconds for potential sync operations)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    // Make the fetch request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal
    });    clearTimeout(timeoutId);

    // Check if response is empty (this causes "Unexpected end of JSON input")
    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Server returned empty response');
    }

    // Parse the JSON response
    try {
      const data = JSON.parse(text);
      // Return data even if response is not "ok"
      // The API might return success: false with a message
      // and we want to handle that in the component
      return data;
    } catch (jsonError) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}
