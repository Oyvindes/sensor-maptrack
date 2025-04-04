/**
 * API Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { ApiService } from './apiService';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      request: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

// Mock ErrorService
vi.mock('@/services/error/errorService', () => ({
  ErrorService: {
    handleError: vi.fn(),
  },
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock setTimeout
vi.useFakeTimers();

describe('ApiService', () => {
  let apiService: ApiService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a new instance for each test
    apiService = ApiService.getInstance('/api');
    
    // Get the mock axios instance
    mockAxiosInstance = (axios.create as any).mock.results[0].value;
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = ApiService.getInstance();
      const instance2 = ApiService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should create a new instance with the provided base URL', () => {
      const customBaseUrl = '/custom-api';
      ApiService.getInstance(customBaseUrl);
      
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: customBaseUrl,
        })
      );
    });
  });

  describe('get', () => {
    it('should make a GET request with the correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        data: { id: 1, name: 'Test' },
        status: 200,
        statusText: 'OK',
      };
      
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);
      
      // Make the request
      const response = await apiService.get('/users/1');
      
      // Verify the request was made correctly
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/users/1',
        })
      );
      
      // Verify the response
      expect(response).toEqual({
        data: mockResponse.data,
        error: null,
        status: 200,
        success: true,
        message: 'OK',
        timestamp: expect.any(String),
      });
    });

    it('should return cached data for repeated GET requests', async () => {
      // Setup mock response for first request
      const mockResponse = {
        data: { id: 1, name: 'Test' },
        status: 200,
        statusText: 'OK',
      };
      
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);
      
      // Make the first request
      await apiService.get('/users/1');
      
      // Make the second request (should use cache)
      const response = await apiService.get('/users/1');
      
      // Verify axios was only called once
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
      
      // Verify the response indicates it came from cache
      expect(response.message).toBe('Data retrieved from cache');
    });

    it('should not use cache when useCache is false', async () => {
      // Setup mock responses
      const mockResponse1 = {
        data: { id: 1, name: 'Test 1' },
        status: 200,
        statusText: 'OK',
      };
      
      const mockResponse2 = {
        data: { id: 1, name: 'Test 2' },
        status: 200,
        statusText: 'OK',
      };
      
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse1);
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse2);
      
      // Make the first request
      await apiService.get('/users/1');
      
      // Make the second request with useCache: false
      const response = await apiService.get('/users/1', { useCache: false });
      
      // Verify axios was called twice
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
      
      // Verify the response has the updated data
      expect(response.data).toEqual(mockResponse2.data);
    });
  });

  describe('post', () => {
    it('should make a POST request with the correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        data: { id: 1, name: 'Test' },
        status: 201,
        statusText: 'Created',
      };
      
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);
      
      // Make the request
      const requestData = { name: 'Test' };
      const response = await apiService.post('/users', requestData);
      
      // Verify the request was made correctly
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/users',
          data: requestData,
        })
      );
      
      // Verify the response
      expect(response).toEqual({
        data: mockResponse.data,
        error: null,
        status: 201,
        success: true,
        message: 'Created',
        timestamp: expect.any(String),
      });
    });
  });

  describe('put', () => {
    it('should make a PUT request with the correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        data: { id: 1, name: 'Updated Test' },
        status: 200,
        statusText: 'OK',
      };
      
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);
      
      // Make the request
      const requestData = { name: 'Updated Test' };
      const response = await apiService.put('/users/1', requestData);
      
      // Verify the request was made correctly
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: '/users/1',
          data: requestData,
        })
      );
      
      // Verify the response
      expect(response).toEqual({
        data: mockResponse.data,
        error: null,
        status: 200,
        success: true,
        message: 'OK',
        timestamp: expect.any(String),
      });
    });
  });

  describe('delete', () => {
    it('should make a DELETE request with the correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        data: {},
        status: 204,
        statusText: 'No Content',
      };
      
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);
      
      // Make the request
      const response = await apiService.delete('/users/1');
      
      // Verify the request was made correctly
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/users/1',
        })
      );
      
      // Verify the response
      expect(response).toEqual({
        data: mockResponse.data,
        error: null,
        status: 204,
        success: true,
        message: 'No Content',
        timestamp: expect.any(String),
      });
    });
  });

  describe('error handling', () => {
    it('should retry failed requests', async () => {
      // Setup mock error response
      const mockError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
        message: 'Request failed with status code 500',
      };
      
      // Setup mock success response after retries
      const mockResponse = {
        data: { id: 1, name: 'Test' },
        status: 200,
        statusText: 'OK',
      };
      
      // First two requests fail, third succeeds
      mockAxiosInstance.request.mockRejectedValueOnce(mockError);
      mockAxiosInstance.request.mockRejectedValueOnce(mockError);
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);
      
      // Make the request
      const response = await apiService.get('/users/1', { retries: 2 });
      
      // Verify the request was retried
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
      
      // Verify the response is successful
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResponse.data);
      
      // Verify the retry delay
      expect(vi.getTimerCount()).toBe(0); // All timers should have been executed
    });

    it('should handle request failure after all retries', async () => {
      // Setup mock error response
      const mockError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
        message: 'Request failed with status code 500',
      };
      
      // All requests fail
      mockAxiosInstance.request.mockRejectedValue(mockError);
      
      // Make the request
      const response = await apiService.get('/users/1', { retries: 2 });
      
      // Verify the request was retried
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
      
      // Verify the response is an error
      expect(response.success).toBe(false);
      expect(response.status).toBe(500);
      expect(response.message).toBe('Request failed with status code 500');
    });

    it('should not retry for non-retryable status codes', async () => {
      // Setup mock error response
      const mockError = {
        response: {
          status: 404,
          statusText: 'Not Found',
        },
        message: 'Request failed with status code 404',
      };
      
      // Request fails
      mockAxiosInstance.request.mockRejectedValue(mockError);
      
      // Make the request
      const response = await apiService.get('/users/999', {
        retries: 2,
        retryStatusCodes: [500, 502, 503],
      });
      
      // Verify the request was not retried
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
      
      // Verify the response is an error
      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('cache management', () => {
    it('should clear the entire cache', async () => {
      // Setup mock responses
      const mockResponse1 = {
        data: { id: 1, name: 'Test 1' },
        status: 200,
        statusText: 'OK',
      };
      
      const mockResponse2 = {
        data: { id: 2, name: 'Test 2' },
        status: 200,
        statusText: 'OK',
      };
      
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse1);
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse2);
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse1);
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse2);
      
      // Make requests to cache data
      await apiService.get('/users/1');
      await apiService.get('/users/2');
      
      // Clear the cache
      apiService.clearCache();
      
      // Make the same requests again
      await apiService.get('/users/1');
      await apiService.get('/users/2');
      
      // Verify axios was called 4 times (no cache hits)
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(4);
    });

    it('should clear cache entries matching a pattern', async () => {
      // Setup mock responses
      const mockResponse1 = {
        data: { id: 1, name: 'Test 1' },
        status: 200,
        statusText: 'OK',
      };
      
      const mockResponse2 = {
        data: { id: 2, name: 'Test 2' },
        status: 200,
        statusText: 'OK',
      };
      
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse1);
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse2);
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse1);
      
      // Make requests to cache data
      await apiService.get('/users/1');
      await apiService.get('/products/1');
      
      // Clear cache entries matching /users/
      apiService.clearCache(/users/);
      
      // Make the same requests again
      await apiService.get('/users/1');
      const productsResponse = await apiService.get('/products/1');
      
      // Verify axios was called 3 times (one cache hit for products)
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
      
      // Verify the products response came from cache
      expect(productsResponse.message).toBe('Data retrieved from cache');
    });

    it('should expire cache entries after TTL', async () => {
      // Setup mock responses
      const mockResponse = {
        data: { id: 1, name: 'Test' },
        status: 200,
        statusText: 'OK',
      };
      
      mockAxiosInstance.request.mockResolvedValue(mockResponse);
      
      // Make request with short TTL
      await apiService.get('/users/1', { cacheTTL: 1000 }); // 1 second TTL
      
      // Fast-forward time by 2 seconds
      vi.advanceTimersByTime(2000);
      
      // Make the same request again
      await apiService.get('/users/1');
      
      // Verify axios was called twice (cache expired)
      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    });
  });

  describe('file operations', () => {
    it('should upload a file with the correct parameters', async () => {
      // Setup mock response
      const mockResponse = {
        data: { id: 1, filename: 'test.jpg' },
        status: 200,
        statusText: 'OK',
      };
      
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);
      
      // Create a mock file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Make the request
      const response = await apiService.uploadFile('/upload', file, 'image', { userId: 1 });
      
      // Verify the request was made correctly
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/upload',
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data',
          }),
        })
      );
      
      // Verify FormData was used
      const requestConfig = mockAxiosInstance.request.mock.calls[0][0];
      expect(requestConfig.data instanceof FormData).toBe(true);
      
      // Verify the response
      expect(response).toEqual({
        data: mockResponse.data,
        error: null,
        status: 200,
        success: true,
        message: 'OK',
        timestamp: expect.any(String),
      });
    });

    it('should download a file with the correct parameters', async () => {
      // Setup mock response
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      const mockResponse = {
        data: mockBlob,
        status: 200,
        statusText: 'OK',
      };
      
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);
      
      // Make the request
      const response = await apiService.downloadFile('/files/1');
      
      // Verify the request was made correctly
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/files/1',
          responseType: 'blob',
        })
      );
      
      // Verify the response
      expect(response).toEqual({
        data: mockBlob,
        error: null,
        status: 200,
        success: true,
        message: 'OK',
        timestamp: expect.any(String),
      });
    });
  });
});