import * as React from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Typography,
  Menu, Avatar, Button, MenuItem, Divider
} from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../App';
import type { AuthUser } from '../api/types/api.types';

const NAV_ITEMS = [
  { label: 'Kalenteri', path: '/' },
  { label: 'Hallinta', path: '/management' },
];

const navButtonSx = {
  color: 'white',
  borderRadius: 0,
  px: 1.5,
  py: 0,
  height: '100%',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 400,
  minWidth: 0,
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.12)' },
};

const dividerSx = {
  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: '1px',
};

function UserMenu({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const displayName = user.nimi || user.username || 'User';

  return (
    <Box sx={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
      <Divider orientation="vertical" flexItem sx={dividerSx} />
      <Button
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ ...navButtonSx, px: 2, display: 'flex', gap: 1.5 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'inherit' }}>
          {displayName}
        </Typography>
        <Avatar
          sx={{
            width: 26,
            height: 26,
            bgcolor: '#C697E1',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'black'
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      </Button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
        slotProps={{ paper: { sx: { mt: '1px', minWidth: 180, borderRadius: 0 } } }}
      >
        <MenuItem
          onClick={() => { onLogout(); setAnchor(null); }}
          sx={{ color: '#ff1744', fontSize: '0.875rem', gap: 1.5 }}
        >
          <LogoutIcon fontSize="small" />
          Kirjaudu ulos
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [mobileAnchor, setMobileAnchor] = React.useState<null | HTMLElement>(null);
  const { user, setUser } = React.useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar
        variant="dense"
        disableGutters
        sx={{
          height: 48,
          minHeight: 48,
          display: 'flex',
          justifyContent: 'space-between',
          px: 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
          <IconButton
            color="inherit"
            onClick={(e) => setMobileAnchor(e.currentTarget)}
            sx={{
              display: { xs: 'flex', md: 'none' },
              px: 2,
              borderRadius: 0,
              ml: 0
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="subtitle1"
            component="div"
            onClick={() => navigate('/')}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.05rem',
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              px: 2,
            }}
          >
            Työjärjestykset
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch' }}>
            <Divider orientation="vertical" flexItem sx={dividerSx} />
            {NAV_ITEMS.map((item) => (
              <React.Fragment key={item.label}>
                <Button
                  onClick={() => navigate(item.path)}
                  sx={{
                    ...navButtonSx,
                    backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  {item.label}
                </Button>
                <Divider orientation="vertical" flexItem sx={dividerSx} />
              </React.Fragment>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <>
              <Divider orientation="vertical" flexItem sx={dividerSx} />
              <Button onClick={onLoginClick} sx={navButtonSx}>
                Kirjaudu
              </Button>
              <Divider orientation="vertical" flexItem sx={dividerSx} />
            </>
          )}
        </Box>

        <Menu
          anchorEl={mobileAnchor}
          open={Boolean(mobileAnchor)}
          onClose={() => setMobileAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          disableScrollLock
          slotProps={{ paper: { sx: { width: 200, borderRadius: 0, mt: '1px' } } }}
        >
          {NAV_ITEMS.map((item) => (
            <MenuItem
              key={item.label}
              onClick={() => { navigate(item.path); setMobileAnchor(null); }}
              selected={location.pathname === item.path}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}