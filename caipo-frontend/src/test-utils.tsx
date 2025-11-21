import React, { ReactElement } from 'react';
// @ts-ignore - @testing-library/react is installed, this is a TypeScript resolution issue
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from './store/store';
import appSlice from './store/slices/appSlice';
import authSlice from './store/slices/authSlice';

// Define PreloadedState type manually (not exported from @reduxjs/toolkit)
type PreloadedState = Partial<RootState>;

// Create a test store helper
export function createTestStore(preloadedState?: PreloadedState) {
  const storeConfig: any = {
    reducer: {
      app: appSlice,
      auth: authSlice,
    },
  };
  
  if (preloadedState) {
    storeConfig.preloadedState = preloadedState;
  }
  
  return configureStore(storeConfig);
}

// Custom render function that includes Redux Provider
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: PreloadedState;
  store?: ReturnType<typeof createTestStore>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

