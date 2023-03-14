import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const ListItemTextStyling = { marginLeft: 5, fontSize: 20, fontWeight: 'bold' };

function CollapsibleMenu({ pathname }: {pathname: string}) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Tab' || event.key === 'Shift')) return true;
    return false;
  };

  const toggleDrawer = (event: React.SyntheticEvent) => {
    const keyDown = event as React.KeyboardEvent;
    if (event.type === 'keydown' && handleKeyDown(keyDown)) {
      return;
    }
    setOpenDrawer(!openDrawer);
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
    >
      <MenuList>
        <MenuItem component={NavLink} to="/">
          <ListItemIcon>
            <HomeIcon fontSize="medium" />
          </ListItemIcon>
          <ListItemText
            sx={{ color: pathname === '/' ? '#b20e0e' : '#5e6870' }}
            primaryTypographyProps={{ ...ListItemTextStyling }}
          >
            Home
          </ListItemText>
        </MenuItem>
        <MenuItem component={NavLink} to="/pins">
          <ListItemIcon>
            <AccountCircleIcon fontSize="medium" />
          </ListItemIcon>
          <ListItemText
            sx={{ color: pathname === '/pins' ? '#b20e0e' : '#5e6870' }}
            primaryTypographyProps={{ ...ListItemTextStyling }}
          >
            My Pins
          </ListItemText>
        </MenuItem>
        <MenuItem
          component={NavLink}
          to={pathname.includes('profile') ? pathname : '/profile/63acc05f21481fa569a03b0b'}
        >
          <ListItemIcon>
            <PeopleAltOutlinedIcon fontSize="medium" />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ ...ListItemTextStyling }}
            sx={{ color: pathname.includes('profile') ? '#b20e0e' : '#5e6870' }}
          >
            Users
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => window.location.assign('/auth/logout')}>
          <ListItemIcon>
            <LogoutIcon fontSize="medium" />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ ...ListItemTextStyling }}
            sx={{ color: '#5e6870' }}
          >
            Logout
          </ListItemText>
        </MenuItem>
      </MenuList>
    </Box>
  );

  return (
    <div>
      <MenuIcon
        onClick={toggleDrawer}
        fontSize="large"
        sx={{ marginLeft: 1, marginRight: 1 }}
      />
      <Drawer
        anchor="top"
        open={openDrawer}
        onClose={toggleDrawer}
      >
        {list()}
      </Drawer>
    </div>
  );
}

export default CollapsibleMenu;
