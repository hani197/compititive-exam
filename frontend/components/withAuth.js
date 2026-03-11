import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

export function withAuth(Component) {
  return function ProtectedPage(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

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
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) router.push('/login');
        else if (user.role !== 'admin' && !user.is_staff) router.push('/dashboard');
      }
    }, [user, loading, router]);

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
