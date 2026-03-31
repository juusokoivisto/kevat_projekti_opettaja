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

{/*NAPPIEN SÄÄTÖ JA UUSIEN NAPPIEN LISÄÄMINEN PAGES ARRAYHIN UUSI NAPPI ILMESTYY NAVIIN */ }
const pages = ['Kalenteri', 'Opettajat'];
{/*NAPPIEN REITIT HELPOSTI LISÄTTÄVISSÄ TÄSTÄ AVAIMENA NAPIN NIMI JA PERÄÄN ANTAA SILLE REITTI */ }
const routes: Record<string, string> = {
  Kalenteri: '/',
  Opettajat: '/newteacher'
};
{/*SETTINGS ON KÄYTTÄJÄ AVATARIN DROWNDOWN VALIKKO */ }
const settings = ['Profiili', 'Kirjaudu ulos'];

type NavbarProps = {
  onLoginClick: () => void
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const theme = useTheme();
  const { toggleDarkMode } = React.useContext(ColorModeContext);
  const { user, setUser } = React.useContext(UserContext);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const navButtonStyle = {
    color: 'white',
    height: '100%',
    borderRadius: 0,
    px: 3,
    textTransform: 'none',
    fontSize: '1rem',
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
  };

  return (
    <AppBar position="static" sx={{ borderRadius: '0 0 8px 8px', mb: 2 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
        <Toolbar disableGutters sx={{ height: 64 }}>

          {/* Desktop Logo */}
          <Typography
            variant="h6" noWrap component="a" href="/"
            sx={{
              mr: 2, px: 2, display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace', fontWeight: 700,
              letterSpacing: '.1rem', color: 'inherit', textDecoration: 'none',
            }}
          >
            Työjärjestykset
          </Typography>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => { handleCloseNavMenu(); navigate(routes[page]); }}>
                  <Typography>{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Typography
            variant="h5" noWrap component="a" href="/"
            sx={{
              mr: 2, display: { xs: 'flex', md: 'none' }, flexGrow: 1,
              fontFamily: 'monospace', fontWeight: 700,
              color: 'inherit', textDecoration: 'none',
            }}
          >
            Työjärjestykset
          </Typography>

          {/* Desktop Nav */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignSelf: 'stretch' }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => navigate(routes[page])}
                sx={navButtonStyle}
              >
                {page}
              </Button>
            ))}
          </Box>

          {/* Right side: Login & Icons */}
          <Box sx={{ display: 'flex', alignSelf: 'stretch', alignItems: 'center' }}>
            {!user ? (
              <Button onClick={onLoginClick} sx={navButtonStyle}>
                Kirjaudu
              </Button>
            ) : (
              <Button
                onClick={() => setUser(null)}
                sx={{ ...navButtonStyle, color: '#ff1744' }}
              >
                Kirjaudu ulos
              </Button>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <Tooltip title="Vaihda teema">
                <IconButton onClick={toggleDarkMode} color="inherit">
                  {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              {user && (
                <Box sx={{ ml: 1 }}>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      {user.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    sx={{ mt: '45px' }} anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}
                  >
                    {settings.map((setting) => (
                      <MenuItem key={setting} onClick={() => { if (setting === 'Kirjaudu ulos') setUser(null); handleCloseUserMenu(); }}>
                        <Typography>{setting}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              )}
            </Box>
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}