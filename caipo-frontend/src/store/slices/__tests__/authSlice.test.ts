import authReducer, { logout, checkAuth, loginUser, registerUser, clearAuthError } from '../authSlice';
import { axiosClient } from '../../../api/axiosClient';
import { User } from '../../../types/auth';

// Mock axiosClient
jest.mock('../../../api/axiosClient', () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
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
});

describe('authSlice', () => {
  const initialState = {
    user: null,
    loading: true,
    isAuthenticated: false,
  };

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('logout', () => {
    it('should clear user and set isAuthenticated to false', () => {
      const stateWithUser = {
        user: { id: '1', email: 'test@example.com' } as User,
        loading: false,
        isAuthenticated: true,
      };
      const action = logout();
      const result = authReducer(stateWithUser, action);
      
      expect(result.user).toBe(null);
      expect(result.isAuthenticated).toBe(false);
      expect(localStorageMock.getItem('accessToken')).toBe(null);
    });
  });

  describe('clearAuthError', () => {
    it('should execute clearAuthError reducer', () => {
      const state = {
        user: { id: '1', email: 'test@example.com' } as User,
        loading: false,
        isAuthenticated: true,
      };
      const action = clearAuthError();
      const result = authReducer(state, action);
      
      expect(result).toEqual(state);
    });
  });

  describe('checkAuth', () => {
    it('should handle pending state', () => {
      const action = { type: checkAuth.pending.type };
      const result = authReducer(initialState, action);
      expect(result.loading).toBe(true);
    });

    it('should handle fulfilled state', () => {
      const mockUser: User = { id: '1', email: 'test@example.com' };
      const action = {
        type: checkAuth.fulfilled.type,
        payload: mockUser,
      };
      const result = authReducer(initialState, action);
      
      expect(result.user).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
      expect(result.loading).toBe(false);
    });

    it('should handle rejected state', () => {
      localStorageMock.setItem('accessToken', 'old-token');
      const stateWithUser = {
        user: { id: '1', email: 'test@example.com' } as User,
        loading: true,
        isAuthenticated: true,
      };
      const action = { type: checkAuth.rejected.type };
      const result = authReducer(stateWithUser, action);
      
      expect(result.user).toBe(null);
      expect(result.isAuthenticated).toBe(false);
      expect(result.loading).toBe(false);
      expect(localStorageMock.getItem('accessToken')).toBe(null);
    });
  });

  describe('loginUser', () => {
    it('should handle pending state', () => {
      const action = { type: loginUser.pending.type };
      const result = authReducer(initialState, action);
      expect(result.loading).toBe(true);
    });

    it('should handle fulfilled state', () => {
      const mockUser: User = { id: '1', email: 'test@example.com' };
      const action = {
        type: loginUser.fulfilled.type,
        payload: { user: mockUser, accessToken: 'token123' },
      };
      const result = authReducer(initialState, action);
      
      expect(result.user).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
      expect(result.loading).toBe(false);
    });

    it('should handle rejected state', () => {
      const stateWithLoading: typeof initialState = {
        user: null,
        loading: true,
        isAuthenticated: false,
      };
      const action = { type: loginUser.rejected.type };
      const result = authReducer(stateWithLoading, action);
      
      expect(result.loading).toBe(false);
      expect(result.isAuthenticated).toBe(false);
    });
  });

  describe('registerUser', () => {
    it('should handle pending state', () => {
      const action = { type: registerUser.pending.type };
      const result = authReducer(initialState, action);
      expect(result.loading).toBe(true);
    });

    it('should handle fulfilled state', () => {
      const mockUser: User = { id: '2', email: 'newuser@example.com' };
      const action = {
        type: registerUser.fulfilled.type,
        payload: { user: mockUser, accessToken: 'token456' },
      };
      const result = authReducer(initialState, action);
      
      expect(result.user).toEqual(mockUser);
      expect(result.isAuthenticated).toBe(true);
      expect(result.loading).toBe(false);
    });

    it('should handle rejected state', () => {
      const stateWithLoading: typeof initialState = {
        user: null,
        loading: true,
        isAuthenticated: false,
      };
      const action = { type: registerUser.rejected.type };
      const result = authReducer(stateWithLoading, action);
      
      expect(result.loading).toBe(false);
      expect(result.isAuthenticated).toBe(false);
    });
  });

  describe('async thunks integration', () => {
    it('checkAuth should call axiosClient.get with correct endpoint', async () => {
      const mockUser: User = { id: '1', email: 'test@example.com' };
      (axiosClient.get as jest.Mock).mockResolvedValue({ data: mockUser });
      localStorageMock.setItem('accessToken', 'test-token');

      const result = await checkAuth()(
        (action: any) => action,
        () => ({} as any),
        undefined
      );

      expect(axiosClient.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result.type).toBe(checkAuth.fulfilled.type);
      expect(result.payload).toEqual(mockUser);
    });

    it('checkAuth should throw error when no token', async () => {
      localStorageMock.removeItem('accessToken');

      const result = await checkAuth()(
        (action: any) => action,
        () => ({} as any),
        undefined
      );

      expect(result.type).toBe(checkAuth.rejected.type);
      expect(axiosClient.get).not.toHaveBeenCalled();
    });

    it('loginUser should call axiosClient.post with correct data', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@example.com' },
        accessToken: 'token123',
      };
      (axiosClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await loginUser({ email: 'test@example.com', password: 'password123' })(
        (action: any) => action,
        () => ({} as any),
        undefined
      );

      expect(axiosClient.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.type).toBe(loginUser.fulfilled.type);
      expect(result.payload).toEqual(mockResponse);
      expect(localStorageMock.getItem('accessToken')).toBe('token123');
    });

    it('registerUser should call axiosClient.post with correct data', async () => {
      const mockResponse = {
        user: { id: '2', email: 'newuser@example.com' },
        accessToken: 'token456',
      };
      (axiosClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await registerUser({ email: 'newuser@example.com', password: 'password123' })(
        (action: any) => action,
        () => ({} as any),
        undefined
      );

      expect(axiosClient.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'newuser@example.com',
        password: 'password123',
      });
      expect(result.type).toBe(registerUser.fulfilled.type);
      expect(result.payload).toEqual(mockResponse);
      expect(localStorageMock.getItem('accessToken')).toBe('token456');
    });
  });
});

