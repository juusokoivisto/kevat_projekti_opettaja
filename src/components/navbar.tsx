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
import { ColorModeContext } from '../App';

const pages = ['Kalenteri', 'Opettajat', 'Kirjaudu'];
const routes: Record<string, string> = {
  Kalenteri: '/',
  Opettajat: '/teachers',
  Kirjaudu: '/login',
};
const settings = ['Profiili', 'Kirjaudu ulos'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [anchorElTeachers, setAnchorElTeachers] = React.useState<null | HTMLElement>(null);
  const [openTeachers, setOpenTeachers] = React.useState(false);

  const theme = useTheme();
  const { toggleDarkMode } = React.useContext(ColorModeContext);
  const navigate = useNavigate();

  const handleOpenTeachersMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElTeachers(event.currentTarget);
  const handleCloseTeachersMenu = () => setAnchorElTeachers(null);
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  return (
    <AppBar position="static" sx={{ borderRadius: '0 0 8px 8px', mb: 2 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/* Desktop title */}
          <Typography
            variant="h6" noWrap component="a"
            href="/"
            sx={{
              mr: 2, display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace', fontWeight: 700,
              letterSpacing: '.1rem', color: 'inherit', textDecoration: 'none',
            }}
          >
            Työjärjestykset
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar" anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)} onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => {
                if (page === 'Opettajat') {
                  return (
                    <div key={page}>
                      <MenuItem onClick={() => setOpenTeachers(!openTeachers)}>
                        <Typography>{page}</Typography>
                      </MenuItem>
                      {openTeachers && (
                        <>
                          <MenuItem sx={{ pl: 4 }}><Typography>Opettaja 1</Typography></MenuItem>
                          <MenuItem sx={{ pl: 4 }}><Typography>Opettaja 2</Typography></MenuItem>
                          <MenuItem sx={{ pl: 4 }} onClick={() => { handleCloseTeachersMenu(); navigate('/newteacher'); }}>
                            <Typography>Lisää opettaja</Typography>
                          </MenuItem>
                        </>
                      )}
                    </div>
                  );
                }
                return (
                  <MenuItem key={page} onClick={() => { handleCloseNavMenu(); navigate(routes[page]); }}>
                    <Typography>{page}</Typography>
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>

          {/* Mobile title */}
          <Typography
            variant="h5" noWrap component="a"
            href="/"
            sx={{
              mr: 2, display: { xs: 'flex', md: 'none' }, flexGrow: 1,
              fontFamily: 'monospace', fontWeight: 700,
              letterSpacing: '.3rem', color: 'inherit', textDecoration: 'none',
            }}
          >
            Työjärjestykset
          </Typography>

          {/* Desktop nav */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => {
              if (page === 'Opettajat') {
                return (
                  <React.Fragment key={page}>
                    <Button onClick={handleOpenTeachersMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
                      {page}
                    </Button>
                    <Menu anchorEl={anchorElTeachers} open={Boolean(anchorElTeachers)} onClose={handleCloseTeachersMenu}>
                      <MenuItem onClick={handleCloseTeachersMenu}><Typography>Opettaja 1</Typography></MenuItem>
                      <MenuItem onClick={handleCloseTeachersMenu}><Typography>Opettaja 2</Typography></MenuItem>
                      <MenuItem onClick={() => { handleCloseTeachersMenu(); navigate('/newteacher'); }}>
                        <Typography>Lisää opettaja</Typography>
                      </MenuItem>
                    </Menu>
                  </React.Fragment>
                );
              }
              return (
                <Button key={page} onClick={() => { handleCloseNavMenu(); navigate(routes[page]); }}
                  sx={{ my: 2, color: 'white', display: 'block' }}>
                  {page}
                </Button>
              );
            })}
          </Box>

          {/* Dark mode toggle */}
          <Tooltip title="Vaihda teema">
            <IconButton onClick={toggleDarkMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Avaa asetukset">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }} id="menu-appbar" anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;