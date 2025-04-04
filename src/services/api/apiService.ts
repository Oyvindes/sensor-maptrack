/**
 * API Service
 * A standardized API service with caching and retry mechanisms
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ErrorService } from '@/services/error/errorService';
import { ActionType } from '@/state/StateContext';

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
  status: number;
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * API request options
 */
export interface ApiRequestOptions extends AxiosRequestConfig {
  useCache?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
  retries?: number;
  retryDelay?: number; // Delay between retries in milliseconds
  retryStatusCodes?: number[]; // HTTP status codes to retry
  dispatch?: (action: any) => void; // Optional dispatch function for state updates
}

/**
 * Default API request options
 */
const defaultOptions: ApiRequestOptions = {
  useCache: true,
  cacheTTL: 300000, // 5 minutes
  retries: 3,
  retryDelay: 1000, // 1 second
  retryStatusCodes: [408, 429, 500, 502, 503, 504], // Common retry status codes
};

/**
 * API Service
 * Provides standardized API request handling with caching and retry mechanisms
 */
export class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  /**
   * Constructor
   * @param baseURL Base URL for API requests
   */
  private constructor(baseURL: string = '/api') {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = sessionStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle unauthorized errors (401)
        if (error.response && error.response.status === 401) {
          // Clear auth data
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_user');
          
          // Redirect to login page if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Set up cache cleanup interval
    setInterval(() => this.cleanupCache(), 60000); // Clean up every minute
  }

  /**
   * Get API service instance
   * @param baseURL Base URL for API requests
   * @returns API service instance
   */
  public static getInstance(baseURL?: string): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(baseURL);
    }
    return ApiService.instance;
  }

  /**
   * Generate cache key for a request
   * @param method HTTP method
   * @param url Request URL
   * @param params URL parameters
   * @param data Request body data
   * @returns Cache key
   */
  private generateCacheKey(method: string, url: string, params?: any, data?: any): string {
    return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
  }

  /**
   * Check if cached data is valid
   * @param key Cache key
   * @returns Whether cached data is valid
   */
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return now - cached.timestamp < cached.ttl;
  }

  /**
   * Get cached data
   * @param key Cache key
   * @returns Cached data or null if not found
   */
  private getCachedData(key: string): any {
    if (!this.isCacheValid(key)) {
      this.cache.delete(key);
      return null;
    }
    
    return this.cache.get(key)?.data || null;
  }

  /**
   * Set cached data
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds
   */
  private setCachedData(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear cache
   * @param keyPattern Optional pattern to match cache keys
   */
  public clearCache(keyPattern?: RegExp): void {
    if (!keyPattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (keyPattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Make an API request with retries and caching
   * @param method HTTP method
   * @param url Request URL
   * @param options Request options
   * @returns API response
   */
  private async request<T = any>(
    method: string,
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    // Merge options with defaults
    const opts: ApiRequestOptions = { ...defaultOptions, ...options };
    const {
      useCache,
      cacheTTL,
      retries,
      retryDelay,
      retryStatusCodes,
      params,
      data,
      dispatch,
      ...axiosOptions
    } = opts;

    // Generate cache key for GET requests
    const isCacheable = useCache && method.toUpperCase() === 'GET';
    const cacheKey = isCacheable
      ? this.generateCacheKey(method, url, params, data)
      : '';

    // Check cache for GET requests
    if (isCacheable && this.isCacheValid(cacheKey)) {
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return {
          data: cachedData,
          error: null,
          status: 200,
          success: true,
          message: 'Data retrieved from cache',
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Make the request with retries
    let attempts = 0;
    let lastError: AxiosError | null = null;

    while (attempts <= retries) {
      try {
        const response: AxiosResponse<T> = await this.axiosInstance.request({
          method,
          url,
          params,
          data,
          ...axiosOptions,
        });

        // Cache successful GET responses
        if (isCacheable && response.status >= 200 && response.status < 300) {
          this.setCachedData(cacheKey, response.data, cacheTTL!);
          
          // Update cache in global state if dispatch is provided
          if (dispatch) {
            dispatch({
              type: ActionType.SET_CACHE_ITEM,
              payload: {
                key: cacheKey,
                data: response.data,
                ttl: cacheTTL,
              },
            });
          }
        }

        return {
          data: response.data,
          error: null,
          status: response.status,
          success: true,
          message: response.statusText,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        lastError = axiosError;
        
        // Check if we should retry
        const status = axiosError.response?.status;
        const shouldRetry =
          attempts < retries &&
          (!status || retryStatusCodes!.includes(status));
        
        if (shouldRetry) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay! * (attempts + 1)));
          attempts++;
        } else {
          break;
        }
      }
    }

    // Handle the error
    const errorResponse: ApiResponse<T> = {
      data: null,
      error: lastError || new Error('Unknown error'),
      status: lastError?.response?.status || 0,
      success: false,
      message: lastError?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    // Log the error
    ErrorService.handleError(errorResponse.error, {
      context: 'ApiService.request',
      severity: 'error',
      method,
      url,
      status: errorResponse.status,
    });

    return errorResponse;
  }

  /**
   * Make a GET request
   * @param url Request URL
   * @param options Request options
   * @returns API response
   */
  public async get<T = any>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, options);
  }

  /**
   * Make a POST request
   * @param url Request URL
   * @param data Request body data
   * @param options Request options
   * @returns API response
   */
  public async post<T = any>(
    url: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, { ...options, data });
  }

  /**
   * Make a PUT request
   * @param url Request URL
   * @param data Request body data
   * @param options Request options
   * @returns API response
   */
  public async put<T = any>(
    url: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, { ...options, data });
  }

  /**
   * Make a PATCH request
   * @param url Request URL
   * @param data Request body data
   * @param options Request options
   * @returns API response
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, { ...options, data });
  }

  /**
   * Make a DELETE request
   * @param url Request URL
   * @param options Request options
   * @returns API response
   */
  public async delete<T = any>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, options);
  }

  /**
   * Upload a file
   * @param url Request URL
   * @param file File to upload
   * @param fieldName Field name for the file
   * @param additionalData Additional form data
   * @param options Request options
   * @returns API response
   */
  public async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData: Record<string, any> = {},
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    return this.request<T>('POST', url, {
      ...options,
      data: formData,
      headers: {
        ...options.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Download a file
   * @param url Request URL
   * @param options Request options
   * @returns API response with blob data
   */
  public async downloadFile(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<Blob>> {
    return this.request<Blob>('GET', url, {
      ...options,
      responseType: 'blob',
    });
  }
}

// Export a default instance
export default ApiService.getInstance();