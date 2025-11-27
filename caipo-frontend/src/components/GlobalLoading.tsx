import React from 'react';
import { useAppSelector } from '../store/hooks';

const GlobalLoading: React.FC = () => {
  const loading = useAppSelector((state) => state.app.loading);
  const globalLoading = useAppSelector((state) => state.app.globalLoading);

  if (!loading && !globalLoading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
    </div>
  );
};

export default GlobalLoading;