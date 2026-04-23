import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import LogoutIcon from '@mui/icons-material/Logout';
import type { AuthUser } from '../api/types/api.types';

const NAV_ITEMS = [
  { label: 'Kalenteri', path: '/' },
  // { label: 'Opettajat', path: '/teachers' },
  // { label: 'Luokkahuoneet', path: '/classrooms' },
  // { label: 'Ryhmät', path: '/group' },
  // { label: 'Kurssit', path: '/courses' },
  { label: 'Hallinta', path: '/management' },
];

const navButtonSx = {
  color: 'white',
  height: '100%',
  borderRadius: 0,
  px: 2,
  textTransform: 'none',
  fontSize: '0.875rem',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
};

type NavbarProps = {
  onLoginClick: () => void;
};

function UserMenu({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const displayName = user.nimi || user.username || 'User';

  return (
    <Box sx={{ ml: 1 }}>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0 }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: '40px' }}
      >
        <MenuItem onClick={() => setAnchor(null)}>Profiili ({user.username})</MenuItem>
        <MenuItem
          onClick={() => { onLogout(); setAnchor(null); }}
          sx={{
            color: '#ff1744',
            fontWeight: 500,
            display: 'flex',
            gap: 1,
            '&:hover': { backgroundColor: 'rgba(255, 23, 68, 0.08)' },
          }}
        >
          <LogoutIcon fontSize="small" />
          Kirjaudu ulos
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const { user, setUser } = React.useContext(UserContext);
  const navigate = useNavigate();

  const closeMobileMenu = () => setMobileMenuAnchor(null);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
        <Toolbar variant="dense" disableGutters sx={{ minHeight: 48, height: 48 }}>
          <Typography
            variant="subtitle1"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 3,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.05rem',
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '1.1rem',
            }}
          >
            Työjärjestykset
          </Typography>

          <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' }, ml: 2 }}>
            <IconButton size="small" onClick={(e) => setMobileMenuAnchor(e.currentTarget)} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={closeMobileMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {NAV_ITEMS.map(({ label, path }) => (
                <MenuItem key={label} onClick={() => { closeMobileMenu(); navigate(path); }}>
                  <Typography variant="body2">{label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' }, alignSelf: 'stretch', ml: 3 }}>
            {NAV_ITEMS.map(({ label, path }) => (
              <Button key={label} onClick={() => navigate(path)} sx={navButtonSx}>
                {label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', ml: 'auto' }}>
            {!user && (
              <Button onClick={onLoginClick} sx={navButtonSx}>
                Kirjaudu
              </Button>
            )}

            {user && (
              <UserMenu
                user={user}
                onLogout={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                  navigate('/');
                }}
              />
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}