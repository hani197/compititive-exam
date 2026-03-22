import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin' || user?.is_staff;
  const [anchorEl, setAnchorEl] = useState(null);

  const initials = user
    ? ((user.first_name?.[0] || '') + (user.last_name?.[0] || '') || user.username?.[0] || '?').toUpperCase()
    : '?';

  const navItems = isAdmin
    ? [
        { label: 'Users', icon: <PeopleIcon fontSize="small" />, path: '/admin/register' },
        { label: 'Assignments', icon: <AssignmentIcon fontSize="small" />, path: '/admin/assignments' },
        { label: 'Generate Paper', icon: <AutoAwesomeIcon fontSize="small" />, path: '/admin/generate-paper' },
        { label: 'Submissions', icon: <FactCheckIcon fontSize="small" />, path: '/admin/submissions' },
      ]
    : [
        { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
        { label: 'History', icon: <HistoryIcon fontSize="small" />, path: '/history' },
      ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 50%, #7c3aed 100%)',
        borderBottom: 'none',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Brand */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', mr: 2 }}
          onClick={() => navigate(isAdmin ? '/admin/register' : '/dashboard')}
        >
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.18)',
            borderRadius: 2.5,
            p: 0.9,
            display: 'flex',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <SchoolIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize="1.05rem" color="#fff" lineHeight={1}>
              EduCoach
            </Typography>
            <Typography fontSize="0.65rem" color="rgba(255,255,255,0.65)" lineHeight={1.3}>
              {isAdmin ? 'Admin Panel' : 'Student Portal'}
            </Typography>
          </Box>
        </Box>

        {/* Nav Links */}
        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  bgcolor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  backdropFilter: active ? 'blur(10px)' : 'none',
                  border: active ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                  borderRadius: 2.5,
                  px: 1.5, py: 0.7,
                  fontSize: '0.85rem',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* User menu */}
        {user && (
          <>
            <Button
              onClick={e => setAnchorEl(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 3,
                px: 1.5, py: 0.6,
                gap: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <Avatar sx={{
                width: 30, height: 30,
                background: 'linear-gradient(135deg, #f97316, #fbbf24)',
                fontSize: 12, fontWeight: 800,
              }}>
                {initials}
              </Avatar>
              <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="caption" display="block" fontWeight={700} color="#fff" lineHeight={1.2}>
                  {user.first_name || user.username}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.6)" lineHeight={1} fontSize="0.65rem">
                  {isAdmin ? 'Admin' : user.role}
                </Typography>
              </Box>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1.5, minWidth: 190, borderRadius: 3,
                  boxShadow: '0 20px 40px rgba(124,58,237,0.2)',
                  border: '1px solid rgba(167,139,250,0.2)',
                  overflow: 'hidden',
                },
              }}
            >
              <Box sx={{
                px: 2, py: 1.5,
                background: 'linear-gradient(135deg, #f5f0ff, #ede9fe)',
                borderBottom: '1px solid rgba(167,139,250,0.2)',
              }}>
                <Typography variant="body2" fontWeight={700} color="#5b21b6">
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="caption" color="#7c3aed">{user.email}</Typography>
              </Box>
              <MenuItem
                onClick={() => { logout(); setAnchorEl(null); }}
                sx={{ color: '#dc2626', fontWeight: 600, mt: 0.5, mx: 0.5, borderRadius: 2 }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
