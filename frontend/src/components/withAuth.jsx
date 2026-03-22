import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

export function withAuth(Component) {
  return function ProtectedPage(props) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !user) navigate('/login');
    }, [user, loading, navigate]);

    if (loading || !user) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      );
    }

    return <Component {...props} />;
  };
}

export function withAdmin(Component) {
  return function AdminPage(props) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading) {
        if (!user) navigate('/login');
        else if (user.role !== 'admin' && !user.is_staff) navigate('/dashboard');
      }
    }, [user, loading, navigate]);

    if (loading || !user) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      );
    }

    return <Component {...props} />;
  };
}
