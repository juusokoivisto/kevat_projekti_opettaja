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
import AdbIcon from '@mui/icons-material/Adb';

const pages = [
  { label: 'Kalenteri' },
  { label: 'Opettajat', hasMenu: true },
  { label: 'Blog' },
];

const teachersList = ['Lista', 'Opettaja 2'];

const settings = ['Profiili', 'Kirjaudu ulos'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [anchorElTeachers, setAnchorElTeachers] = React.useState<null | HTMLElement>(null);
  const [mobileSubMenu, setMobileSubMenu] = React.useState(false); // uusi tila mobiilille

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
    setMobileSubMenu(false); // resettaa submenun
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
    setMobileSubMenu(false);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleOpenTeachersMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElTeachers(event.currentTarget);
  };

  const handleCloseTeachersMenu = () => setAnchorElTeachers(null);

  const handleOpenMobileTeachers = () => {
    setMobileSubMenu(true);
  };

  const handleBackToMainMenu = () => {
    setMobileSubMenu(false);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          {/* LOGO DESKTOP */}
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            component="a"
            href="#"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Työajan hallinta
          </Typography>

          {/* MOBILE MENU */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton onClick={handleOpenNavMenu} color="inherit">
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
            >
              {!mobileSubMenu && pages.map((page) => {
                if (page.hasMenu) {
                  return (
                    <MenuItem key={page.label} onClick={handleOpenMobileTeachers}>
                      <Typography textAlign="center">{page.label}</Typography>
                    </MenuItem>
                  );
                }

                return (
                  <MenuItem key={page.label} onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">{page.label}</Typography>
                  </MenuItem>
                );
              })}

              {/* Mobiilin opettajat-submenu */}
              {mobileSubMenu && (
                <>
                  <MenuItem onClick={handleBackToMainMenu}>
                    <Typography textAlign="center">← Takaisin</Typography>
                  </MenuItem>
                  {teachersList.map((teacher) => (
                    <MenuItem key={teacher} onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">{teacher}</Typography>
                    </MenuItem>
                  ))}
                </>
              )}
            </Menu>
          </Box>

          {/* LOGO MOBILE */}
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            component="a"
            href="#"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>

          {/* DESKTOP MENU */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => {
              if (page.hasMenu) {
                return (
                  <Button
                    key={page.label}
                    onClick={handleOpenTeachersMenu}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.label}
                  </Button>
                );
              }

              return (
                <Button
                  key={page.label}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.label}
                </Button>
              );
            })}
          </Box>

          {/* USER MENU */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Avaa asetukset">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* TEACHERS DROPDOWN DESKTOP */}
          <Menu
            anchorEl={anchorElTeachers}
            open={Boolean(anchorElTeachers)}
            onClose={handleCloseTeachersMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            {teachersList.map((teacher) => (
              <MenuItem key={teacher} onClick={handleCloseTeachersMenu}>
                <Typography textAlign="center">{teacher}</Typography>
              </MenuItem>
            ))}
          </Menu>

        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;