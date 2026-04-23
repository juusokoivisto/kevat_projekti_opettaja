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
import Divider from '@mui/material/Divider';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import LogoutIcon from '@mui/icons-material/Logout';
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

type NavbarProps = {
  onLoginClick: () => void;
};

function UserMenu({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const displayName = user.nimi || user.username || 'User';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ p: 0, width: 36, height: 36 }}
      >
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

        <Divider />

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
        <Toolbar
          variant="dense"
          disableGutters
          sx={{ height: 48, minHeight: 48, gap: 1 }}
        >
          <Typography
            variant="subtitle1"
            component="a"
            href="/"
            noWrap
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.05rem',
              fontSize: '1.05rem',
              color: 'inherit',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            Työjärjestykset
          </Typography>

          <Box
            component="nav"
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'stretch',
              height: '100%',
              ml: 3,
            }}
          >
            {NAV_ITEMS.map(({ label, path }) => (
              <Button key={label} onClick={() => navigate(path)} sx={navButtonSx}>
                {label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
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

            <IconButton
              size="small"
              color="inherit"
              onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Box>

          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={closeMobileMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { elevation: 2, sx: { mt: 0.5, minWidth: 160 } } }}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {NAV_ITEMS.map(({ label, path }) => (
              <MenuItem
                key={label}
                onClick={() => { closeMobileMenu(); navigate(path); }}
                sx={{ fontSize: '0.875rem' }}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}