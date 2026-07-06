import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/auth.slice';
import { useEffect } from 'react';


export const PublicRoute = () => {

  const user = useSelector(selectUser);

  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
};