import { setLoading, setError } from '../../store/slices/appSlice';

// Mock axios BEFORE any imports that use it
const mockAxiosPost = jest.fn();
jest.mock('axios', () => {
  // We need to avoid requiring the actual axios module
  // Instead, create a mock that provides what we need
  return {
    default: {
      create: jest.fn((config: any) => {
        // Return a mock axios instance
        const instance = {
          defaults: {
            headers: {
              common: {},
            },
            adapter: undefined,
          },
          interceptors: {
            request: {
              use: jest.fn((onFulfilled, onRejected) => {
                instance.interceptors.request.handlers = { onFulfilled, onRejected };
              }),
              handlers: {} as any,
            },
            response: {
              use: jest.fn((onFulfilled, onRejected) => {
                instance.interceptors.response.handlers = { onFulfilled, onRejected };
              }),
              handlers: {} as any,
            },
          },
          get: jest.fn(),
          post: jest.fn(),
        };
        return instance;
      }),
      post: mockAxiosPost,
    },
    create: jest.fn((config: any) => {
      const instance = {
        defaults: {
          headers: { common: {} },
          adapter: undefined,
        },
        interceptors: {
          request: {
            use: jest.fn((onFulfilled, onRejected) => {
              instance.interceptors.request.handlers = { onFulfilled, onRejected };
            }),
            handlers: {} as any,
          },
          response: {
            use: jest.fn((onFulfilled, onRejected) => {
              instance.interceptors.response.handlers = { onFulfilled, onRejected };
            }),
            handlers: {} as any,
          },
        },
        get: jest.fn(),
        post: jest.fn(),
      };
      return instance;
    }),
    post: mockAxiosPost,
  };
});

// Mock the store before importing axiosClient
const mockDispatch = jest.fn();
jest.mock('../../store/store', () => ({
  store: {
    dispatch: mockDispatch,
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.location
const mockLocation = {
  href: '',
};
delete (window as any).location;
(window as any).location = mockLocation;

// Import axiosClient after mocks are set up
import { axiosClient } from '../axiosClient';
import axios from 'axios';

describe('axiosClient', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    mockLocation.href = '';
    mockDispatch.mockClear();
    
    // Mock axios.post for refresh calls
    mockAxiosPost.mockResolvedValue({
      data: { accessToken: 'new-token' },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Request Interceptor', () => {
    it('should attach token from localStorage to Authorization header', async () => {
      localStorageMock.setItem('accessToken', 'test-token-123');
      
      // Mock axios adapter to intercept the request
      const mockAdapter = jest.fn((config) => {
        expect(config.headers.Authorization).toBe('Bearer test-token-123');
        return Promise.resolve({ 
          data: { success: true }, 
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      });
      
      axiosClient.defaults.adapter = mockAdapter;
      
      await axiosClient.get('/api/test');
      
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(true));
    });

    it('should work without token', async () => {
      localStorageMock.removeItem('accessToken');
      
      const mockAdapter = jest.fn((config) => {
        expect(config.headers.Authorization).toBeUndefined();
        return Promise.resolve({ 
          data: { success: true }, 
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      });
      
      axiosClient.defaults.adapter = mockAdapter;
      
      await axiosClient.get('/api/test');
    });

    it('should set loading to true on request', async () => {
      const mockAdapter = jest.fn((config) => 
        Promise.resolve({ 
          data: { success: true }, 
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        })
      );
      axiosClient.defaults.adapter = mockAdapter;
      
      await axiosClient.get('/api/test');
      
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(true));
    });

    it('should handle request errors', async () => {
      const requestError = new Error('Request failed');
      const mockAdapter = jest.fn(() => Promise.reject(requestError));
      axiosClient.defaults.adapter = mockAdapter;
      
      try {
        await axiosClient.get('/api/test');
      } catch (e) {
        // Expected
      }
      
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
    });
  });

  describe('Response Interceptor', () => {
    it('should set loading to false and clear error on success', async () => {
      const mockAdapter = jest.fn((config) => 
        Promise.resolve({ 
          data: { message: 'Success' }, 
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        })
      );
      axiosClient.defaults.adapter = mockAdapter;
      
      await axiosClient.get('/api/test');
      
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
      expect(mockDispatch).toHaveBeenCalledWith(setError(null));
    });

    it('should set loading to false on error', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.reject({
          response: {
            status: 500,
            data: { message: 'Server error' },
          },
          config: { url: '/api/test' },
        })
      );
      axiosClient.defaults.adapter = mockAdapter;
      
      try {
        await axiosClient.get('/api/test');
      } catch (e) {
        // Expected
      }
      
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
    });

    it('should dispatch error message on non-401 errors', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.reject({
          response: {
            status: 500,
            data: { message: 'Internal server error' },
          },
          config: { url: '/api/test' },
        })
      );
      axiosClient.defaults.adapter = mockAdapter;
      
      try {
        await axiosClient.get('/api/test');
      } catch (e) {
        // Expected
      }
      
      expect(mockDispatch).toHaveBeenCalledWith(setError('Internal server error'));
    });

    it('should use error.message when response.data.message is not available', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.reject({
          message: 'Network error',
          config: { url: '/api/test' },
        })
      );
      axiosClient.defaults.adapter = mockAdapter;
      
      try {
        await axiosClient.get('/api/test');
      } catch (e) {
        // Expected
      }
      
      expect(mockDispatch).toHaveBeenCalledWith(setError('Network error'));
    });

    it('should use default error message when neither response nor message exists', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.reject({
          config: { url: '/api/test' },
        })
      );
      axiosClient.defaults.adapter = mockAdapter;
      
      try {
        await axiosClient.get('/api/test');
      } catch (e) {
        // Expected
      }
      
      expect(mockDispatch).toHaveBeenCalledWith(setError('An error occurred'));
    });
  });

  describe('Token Refresh (401 Handling)', () => {
    it('should handle 401 errors by refreshing token', async () => {
      localStorageMock.setItem('accessToken', 'old-token');
      
      let callCount = 0;
      const mockAdapter = jest.fn((config) => {
        callCount++;
        if (callCount === 1) {
          // First call returns 401
          return Promise.reject({
            response: { status: 401 },
            config: { url: '/api/test', headers: {}, _retry: false },
          });
        }
        // Retry after refresh succeeds
        return Promise.resolve({ 
          data: { success: true }, 
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      });
      
      axiosClient.defaults.adapter = mockAdapter;
      mockAxiosPost.mockResolvedValueOnce({
        data: { accessToken: 'new-token-123' },
      });

      await axiosClient.get('/api/test');

      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/refresh'),
        {},
        { withCredentials: true }
      );
    });

    it('should save new token to localStorage after refresh', async () => {
      localStorageMock.setItem('accessToken', 'old-token');
      
      let callCount = 0;
      const mockAdapter = jest.fn((config) => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject({
            response: { status: 401 },
            config: { url: '/api/test', headers: {}, _retry: false },
          });
        }
        return Promise.resolve({ 
          data: { success: true }, 
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      });
      
      axiosClient.defaults.adapter = mockAdapter;
      mockAxiosPost.mockResolvedValueOnce({
        data: { accessToken: 'new-token-456' },
      });

      await axiosClient.get('/api/test');

      expect(localStorageMock.getItem('accessToken')).toBe('new-token-456');
    });

    it('should redirect to /login on refresh failure', async () => {
      localStorageMock.setItem('accessToken', 'old-token');
      
      const mockAdapter = jest.fn(() => 
        Promise.reject({
          response: { status: 401 },
          config: { url: '/api/test', headers: {}, _retry: false },
        })
      );
      
      axiosClient.defaults.adapter = mockAdapter;
      mockAxiosPost.mockRejectedValueOnce(new Error('Refresh failed'));

      try {
        await axiosClient.get('/api/test');
      } catch (e) {
        // Expected
      }

      expect(mockLocation.href).toBe('/login');
      expect(localStorageMock.getItem('accessToken')).toBe(null);
      expect(mockDispatch).toHaveBeenCalledWith(
        setError('Session expired. Please login again.')
      );
    });

    it('should not retry if _retry flag is already set', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.reject({
          response: { status: 401 },
          config: { url: '/api/test', headers: {}, _retry: true },
        })
      );
      
      axiosClient.defaults.adapter = mockAdapter;

      try {
        await axiosClient.get('/api/test');
      } catch (e) {
        // Expected
      }

      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should queue requests during refresh', async () => {
      localStorageMock.setItem('accessToken', 'old-token');
      
      let callCount = 0;
      const mockAdapter = jest.fn((config) => {
        callCount++;
        if (callCount === 1) {
          // First request triggers refresh
          return Promise.reject({
            response: { status: 401 },
            config: { url: '/api/test1', headers: {}, _retry: false },
          });
        }
        if (callCount === 2) {
          // Second request should be queued (returns 401 but refresh is in progress)
          return Promise.reject({
            response: { status: 401 },
            config: { url: '/api/test2', headers: {}, _retry: false },
          });
        }
        // After refresh, both requests should retry
        return Promise.resolve({ 
          data: { success: true, request: config.url }, 
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      });
      
      axiosClient.defaults.adapter = mockAdapter;
      
      // Mock refresh to take some time
      let refreshResolve: any;
      const refreshPromise = new Promise((resolve) => {
        refreshResolve = resolve;
      });
      mockAxiosPost.mockImplementation(() => 
        refreshPromise.then(() => ({
          data: { accessToken: 'new-token' },
        }))
      );

      // Start first request (triggers refresh)
      const promise1 = axiosClient.get('/api/test1');
      
      // Small delay to ensure first request starts refresh
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Start second request (should be queued)
      const promise2 = axiosClient.get('/api/test2');

      // Resolve refresh
      refreshResolve();
      
      // Wait for both requests to complete
      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both should succeed after refresh
      expect(result1.data.success).toBe(true);
      expect(result2.data.success).toBe(true);
      // Refresh should only be called once
      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent 401 errors', async () => {
      localStorageMock.setItem('accessToken', 'old-token');
      
      let callCount = 0;
      const mockAdapter = jest.fn((config) => {
        callCount++;
        if (callCount <= 3) {
          // First 3 requests all return 401 simultaneously
          return Promise.reject({
            response: { status: 401 },
            config: { url: `/api/test${callCount}`, headers: {}, _retry: false },
          });
        }
        // After refresh, all requests should retry successfully
        return Promise.resolve({ 
          data: { success: true, request: config.url }, 
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      });
      
      axiosClient.defaults.adapter = mockAdapter;
      
      // Mock refresh
      mockAxiosPost.mockResolvedValue({
        data: { accessToken: 'new-token' },
      });

      // Start 3 concurrent requests that will all get 401
      const promises = [
        axiosClient.get('/api/test1'),
        axiosClient.get('/api/test2'),
        axiosClient.get('/api/test3'),
      ];

      // All should eventually succeed after refresh
      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((result, index) => {
        expect(result.data.success).toBe(true);
        expect(result.data.request).toBe(`/api/test${index + 1}`);
      });

      // Refresh should only be called once (not 3 times)
      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/refresh'),
        {},
        { withCredentials: true }
      );
    });
  });
});
