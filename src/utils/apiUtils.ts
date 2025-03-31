/**
 * Utility functions for API requests
 */

/**
 * Get the base URL for API requests
 * In development, this will be an empty string (relative path)
 * In production, this will be the value of VITE_API_BASE_URL environment variable
 * @returns The base URL for API requests
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || '';
};

/**
 * Get the full URL for an API endpoint
 * @param endpoint The API endpoint path (e.g., '/api/device/power-toggle')
 * @returns The full URL for the API endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
};