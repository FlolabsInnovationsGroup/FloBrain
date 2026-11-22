import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearError } from '../store/slices/appSlice';
import { toast } from 'react-hot-toast';

const GlobalError: React.FC = () => {
  const error = useAppSelector((state) => state.app.error);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return null;
};

export default GlobalError;