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
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { ColorModeContext, UserContext } from '../App';

const NAV_ITEMS = [
  { label: 'Kalenteri', path: '/' },
  { label: 'Opettajat', path: '/teachers' },
  { label: 'Luokkahuoneet', path: '/classrooms' },
  { label: 'Ryhmät', path: '/group' },
  { label: 'Kurssit', path: '/courses' },
];

const navButtonSx = {
  color: 'white',
  height: '100%',
  borderRadius: 0,
  px: 3,
  textTransform: 'none',
  fontSize: '1rem',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
};

type NavbarProps = {
  onLoginClick: () => void;
};

function UserMenu({ user, onLogout }: { user: string; onLogout: () => void }) {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  return (
    <Box sx={{ ml: 1 }}>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
          {user.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: '45px' }}
      >
        <MenuItem onClick={() => setAnchor(null)}>Profiili</MenuItem>
        <MenuItem onClick={() => { onLogout(); setAnchor(null); }}>Kirjaudu ulos</MenuItem>
      </Menu>
    </Box>
  );
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const theme = useTheme();
  const { toggleDarkMode } = React.useContext(ColorModeContext);
  const { user, setUser } = React.useContext(UserContext);
  const navigate = useNavigate();

  const closeMobileMenu = () => setMobileMenuAnchor(null);

  return (
    <AppBar position="static" sx={{ borderRadius: '0 0 8px 8px', mb: 2 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
        <Toolbar disableGutters sx={{ height: 64 }}>
          <Typography
            variant="h6" noWrap component="a" href="/"
            sx={{
              mr: 2, px: 2,
              fontFamily: 'monospace', fontWeight: 700,
              letterSpacing: '.1rem', color: 'inherit', textDecoration: 'none',
            }}
          >
            Työjärjestykset
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={(e) => setMobileMenuAnchor(e.currentTarget)} color="inherit">
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
                  <Typography>{label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Desktop nav */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignSelf: 'stretch' }}>
            {NAV_ITEMS.map(({ label, path }) => (
              <Button key={label} onClick={() => navigate(path)} sx={navButtonSx}>
                {label}
              </Button>
            ))}
          </Box>

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch' }}>
            {user ? (
              <Button onClick={() => setUser(null)} sx={{ ...navButtonSx, color: '#ff1744' }}>
                Kirjaudu ulos
              </Button>
            ) : (
              <Button onClick={onLoginClick} sx={navButtonSx}>
                Kirjaudu
              </Button>
            )}

            <Tooltip title="Vaihda teema">
              <IconButton onClick={toggleDarkMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {user && <UserMenu user={user} onLogout={() => setUser(null)} />}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}