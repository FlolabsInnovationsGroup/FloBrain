import { setLoading, setError } from '../../store/slices/appSlice';

// Helper to create a mock axios instance with working interceptors
const createMockAxiosInstance = () => {
  const instance: any = {
    defaults: {
      headers: { common: {} },
      adapter: undefined,
    },
    interceptors: {
      request: { handlers: [] as any[] },
      response: { handlers: [] as any[] },
    },
  };

  // Store interceptors when use() is called
  instance.interceptors.request.use = (onFulfilled: any, onRejected: any) => {
    instance.interceptors.request.handlers.push({ onFulfilled, onRejected });
  };

  instance.interceptors.response.use = (onFulfilled: any, onRejected: any) => {
    instance.interceptors.response.handlers.push({ onFulfilled, onRejected });
  };

  // Execute request interceptors, call adapter, then execute response interceptors
  instance.request = function(config: any) {
    if (!config.headers) config.headers = {};
    
    // Apply request interceptors
    let processedConfig = { ...config };
    for (const handler of instance.interceptors.request.handlers) {
      if (handler.onFulfilled) {
        try {
          processedConfig = handler.onFulfilled(processedConfig) || processedConfig;
        } catch (e) {
          if (handler.onRejected) {
            try {
              const result = handler.onRejected(e);
              if (result && typeof result.then === 'function') {
                return result;
              }
              return Promise.reject(result || e);
            } catch (rejectError) {
              return Promise.reject(rejectError);
            }
          }
          return Promise.reject(e);
        }
      }
    }

    // Call adapter
    const adapter = processedConfig.adapter || instance.defaults.adapter;
    if (!adapter) {
      return Promise.reject(new Error('No adapter configured'));
    }

    return Promise.resolve(adapter(processedConfig))
      .then(async (response: any) => {
        // Apply response interceptors (success)
        let processedResponse = response;
        for (const handler of instance.interceptors.response.handlers) {
          if (handler.onFulfilled) {
            processedResponse = handler.onFulfilled(processedResponse) || processedResponse;
          }
        }
        return processedResponse;
      })
      .catch(async (error: any) => {
        // Apply response interceptors (error)
        for (const handler of instance.interceptors.response.handlers) {
          if (handler.onRejected) {
            try {
              return await handler.onRejected(error);
            } catch (e) {
              error = e;
            }
          }
        }
        return Promise.reject(error);
      });
  };

  instance.get = (url: string, config?: any) => instance.request({ ...config, method: 'GET', url });
  instance.post = (url: string, data?: any, config?: any) => instance.request({ ...config, method: 'POST', url, data });

  // Make instance callable like axios
  const callableInstance = (config: any) => instance.request(config);
  Object.assign(callableInstance, instance);
  return callableInstance;
};

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: () => createMockAxiosInstance(),
    post: jest.fn(),
  },
  create: () => createMockAxiosInstance(),
  post: jest.fn(),
}));

// Mock store
// const mockDispatch = jest.fn();
jest.mock('../../store/store', () => ({
  store: { dispatch: jest.fn() },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

// Mock window.location
const mockLocation = { href: '' };
delete (window as any).location;
(window as any).location = mockLocation;

import { axiosClient } from '../axiosClient';
import axios from 'axios';
import { store } from '../../store/store';

const mockAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>;
const mockDispatch = store.dispatch as jest.MockedFunction<typeof store.dispatch>;

describe('axiosClient', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    mockLocation.href = '';
    (mockDispatch as jest.Mock).mockClear();
    (mockAxiosPost as jest.Mock).mockResolvedValue({ data: { accessToken: 'new-token' } });
  });

  describe('Request Interceptor', () => {
    it('should attach token from localStorage to Authorization header and set loading', async () => {
      localStorageMock.setItem('accessToken', 'test-token-123');
      
      const mockAdapter = jest.fn((config) => {
        expect(config.headers.Authorization).toBe('Bearer test-token-123');
        return Promise.resolve({ data: { success: true }, status: 200, statusText: 'OK', headers: {}, config });
      });
      
      (axiosClient.defaults as any).adapter = mockAdapter;
      await axiosClient.get('/api/test');
      
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(true));
    });

    it('should work without token', async () => {
      localStorageMock.removeItem('accessToken');
      
      const mockAdapter = jest.fn((config) => {
        expect(config.headers.Authorization).toBeUndefined();
        return Promise.resolve({ data: { success: true }, status: 200, statusText: 'OK', headers: {}, config });
      });
      
      (axiosClient.defaults as any).adapter = mockAdapter;
      await axiosClient.get('/api/test');
      
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(true));
    });

    it('should set loading to false on request error', async () => {
      const mockAdapter = jest.fn(() => Promise.reject(new Error('Request failed')));
      (axiosClient.defaults as any).adapter = mockAdapter;
      
      await expect(axiosClient.get('/api/test')).rejects.toThrow();
      
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
    });
  });

  describe('Response Interceptor', () => {
    it('should set loading to false and clear error on success', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.resolve({ data: { message: 'Success' }, status: 200, statusText: 'OK', headers: {}, config: { headers: {} } })
      );
      (axiosClient.defaults as any).adapter = mockAdapter;
      
      await axiosClient.get('/api/test');
      
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
      expect(mockDispatch).toHaveBeenCalledWith(setError(null));
    });

    it('should dispatch error message from response.data.message', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.reject({ response: { status: 500, data: { message: 'Internal server error' } }, config: { url: '/api/test' } })
      );
      (axiosClient.defaults as any).adapter = mockAdapter;
      
      await expect(axiosClient.get('/api/test')).rejects.toBeDefined();
      
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
      expect(mockDispatch).toHaveBeenCalledWith(setError('Internal server error'));
    });

    it('should use error.message when response.data.message is not available', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.reject({ message: 'Network error', config: { url: '/api/test' } })
      );
      (axiosClient.defaults as any).adapter = mockAdapter;
      
      await expect(axiosClient.get('/api/test')).rejects.toBeDefined();
      
      expect(mockDispatch).toHaveBeenCalledWith(setError('Network error'));
    });

    it('should use default error message when neither response nor message exists', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.reject({ config: { url: '/api/test' } })
      );
      (axiosClient.defaults as any).adapter = mockAdapter;
      
      await expect(axiosClient.get('/api/test')).rejects.toBeDefined();
      
      expect(mockDispatch).toHaveBeenCalledWith(setError('An error occurred'));
    });
  });

  describe('Token Refresh (401 Handling)', () => {
    it('should refresh token and retry request on 401 error', async () => {
      localStorageMock.setItem('accessToken', 'old-token');
      
      let callCount = 0;
      const mockAdapter = jest.fn((config) => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject({ response: { status: 401 }, config: { url: '/api/test', headers: {}, _retry: false } });
        }
        return Promise.resolve({ data: { success: true }, status: 200, statusText: 'OK', headers: {}, config });
      });
      
      (axiosClient.defaults as any).adapter = mockAdapter;
      (mockAxiosPost as jest.Mock).mockResolvedValueOnce({ data: { accessToken: 'new-token-123' } });

      const result = await axiosClient.get('/api/test');

      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/refresh'),
        {},
        { withCredentials: true }
      );
      expect(localStorageMock.getItem('accessToken')).toBe('new-token-123');
      expect(result.data.success).toBe(true);
    });

    it('should redirect to /login and clear token on refresh failure', async () => {
      localStorageMock.setItem('accessToken', 'old-token');
      
      const mockAdapter = jest.fn(() => 
        Promise.reject({ response: { status: 401 }, config: { url: '/api/test', headers: {}, _retry: false } })
      );
      
      (axiosClient.defaults as any).adapter = mockAdapter;
      (mockAxiosPost as jest.Mock).mockRejectedValueOnce(new Error('Refresh failed'));

      await expect(axiosClient.get('/api/test')).rejects.toBeDefined();

      expect(mockLocation.href).toBe('/login');
      expect(localStorageMock.getItem('accessToken')).toBe(null);
      expect(mockDispatch).toHaveBeenCalledWith(setError('Session expired. Please login again.'));
    });

    it('should not retry if _retry flag is already set', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.reject({ response: { status: 401 }, config: { url: '/api/test', headers: {}, _retry: true } })
      );
      
      (axiosClient.defaults as any).adapter = mockAdapter;

      await expect(axiosClient.get('/api/test')).rejects.toBeDefined();

      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('should queue concurrent requests during token refresh', async () => {
      localStorageMock.setItem('accessToken', 'old-token');
      
      let callCount = 0;
      const mockAdapter = jest.fn((config) => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject({ response: { status: 401 }, config: { url: `/api/test${callCount}`, headers: {}, _retry: false } });
        }
        return Promise.resolve({ data: { success: true, request: config.url }, status: 200, statusText: 'OK', headers: {}, config });
      });
      
      (axiosClient.defaults as any).adapter = mockAdapter;
      (mockAxiosPost as jest.Mock).mockResolvedValue({ data: { accessToken: 'new-token' } });

      const promises = [
        axiosClient.get('/api/test1'),
        axiosClient.get('/api/test2'),
      ];

      const results = await Promise.all(promises);

      expect(results[0].data.success).toBe(true);
      expect(results[1].data.success).toBe(true);
      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    });

    it('should reject queued requests when refresh fails', async () => {
      localStorageMock.setItem('accessToken', 'old-token');
      
      let callCount = 0;
      const mockAdapter = jest.fn((config) => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject({ response: { status: 401 }, config: { url: `/api/test${callCount}`, headers: {}, _retry: false } });
        }
        return Promise.resolve({ data: { success: true }, status: 200, statusText: 'OK', headers: {}, config });
      });
      
      (axiosClient.defaults as any).adapter = mockAdapter;
      
      let refreshResolve: any;
      const refreshPromise = new Promise((resolve) => { refreshResolve = resolve; });
      (mockAxiosPost as jest.Mock).mockImplementation(() => refreshPromise.then(() => Promise.reject(new Error('Refresh failed'))));

      const promise1 = axiosClient.get('/api/test1');
      await new Promise(resolve => setTimeout(resolve, 10));
      const promise2 = axiosClient.get('/api/test2');

      refreshResolve();
      
      await expect(promise1).rejects.toBeDefined();
      await expect(promise2).rejects.toBeDefined();
      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    });

    it('should handle queued request failure after receiving token', async () => {
      localStorageMock.setItem('accessToken', 'old-token');
      
      let callCount = 0;
      const mockAdapter = jest.fn((config) => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject({ response: { status: 401 }, config: { url: '/api/test', headers: {}, _retry: false } });
        }
        if (callCount === 2) {
          return Promise.reject({ response: { status: 500 }, config: { url: '/api/test', headers: {}, _retry: false } });
        }
        return Promise.resolve({ data: { success: true }, status: 200, statusText: 'OK', headers: {}, config });
      });
      
      (axiosClient.defaults as any).adapter = mockAdapter;
      (mockAxiosPost as jest.Mock).mockResolvedValueOnce({ data: { accessToken: 'new-token' } });

      await expect(axiosClient.get('/api/test')).rejects.toBeDefined();
      
      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/refresh'),
        {},
        { withCredentials: true }
      );
    });
  });

  describe('Request Interceptor Error Handler', () => {
    it('should handle errors in request interceptor', async () => {
      const mockAdapter = jest.fn(() => 
        Promise.resolve({ data: { success: true }, status: 200, statusText: 'OK', headers: {}, config: { headers: {} } })
      );
      (axiosClient.defaults as any).adapter = mockAdapter;

      (mockDispatch as jest.Mock).mockImplementation((action) => {
        if (action.type === setLoading(true).type) {
          throw new Error('Request interceptor error');
        }
        return action;
      });

      let errorCaught = false;
      try {
        await axiosClient.get('/api/test');
      } catch (error: any) {
        errorCaught = true;
        expect(error.message).toBe('Request interceptor error');
      }
      
      expect(errorCaught).toBe(true);
      expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
    });
  });
});
