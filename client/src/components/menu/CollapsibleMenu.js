import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const ListItemTextStyling = { marginLeft: 5, fontSize: 20, fontWeight: 'bold' };

const CollapsibleMenu = ({ pathname }) => {
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
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
        <MenuItem onClick={() => window.location.assign('auth/logout')}>
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
};

export default CollapsibleMenu;

CollapsibleMenu.propTypes = {
  pathname: PropTypes.string.isRequired,
};
