import appReducer, { setLoading, setError, setGlobalLoading, clearError } from '../appSlice';

describe('appSlice', () => {
  const initialState = {
    loading: false,
    error: null,
    globalLoading: false,
  };

  it('should return the initial state', () => {
    expect(appReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const action = setLoading(true);
      const result = appReducer(initialState, action);
      expect(result.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const stateWithLoading = { ...initialState, loading: true };
      const action = setLoading(false);
      const result = appReducer(stateWithLoading, action);
      expect(result.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const errorMessage = 'Something went wrong';
      const action = setError(errorMessage);
      const result = appReducer(initialState, action);
      expect(result.error).toBe(errorMessage);
    });

    it('should set error to null', () => {
      const stateWithError = { ...initialState, error: 'Previous error' };
      const action = setError(null);
      const result = appReducer(stateWithError, action);
      expect(result.error).toBe(null);
    });
  });

  describe('setGlobalLoading', () => {
    it('should set globalLoading to true', () => {
      const action = setGlobalLoading(true);
      const result = appReducer(initialState, action);
      expect(result.globalLoading).toBe(true);
    });

    it('should set globalLoading to false', () => {
      const stateWithGlobalLoading = { ...initialState, globalLoading: true };
      const action = setGlobalLoading(false);
      const result = appReducer(stateWithGlobalLoading, action);
      expect(result.globalLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error from state', () => {
      const stateWithError = { ...initialState, error: 'Some error message' };
      const action = clearError();
      const result = appReducer(stateWithError, action);
      expect(result.error).toBe(null);
    });

    it('should not affect other state properties', () => {
      const stateWithError = {
        loading: true,
        error: 'Some error',
        globalLoading: true,
      };
      const action = clearError();
      const result = appReducer(stateWithError, action);
      expect(result.error).toBe(null);
      expect(result.loading).toBe(true);
      expect(result.globalLoading).toBe(true);
    });
  });
});

