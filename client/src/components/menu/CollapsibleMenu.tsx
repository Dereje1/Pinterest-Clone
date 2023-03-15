import React, { useMemo, useState } from 'react';
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

const getMenuItems = (pathname: string) => ({
  home: {
    icon: <HomeIcon fontSize="medium" />,
    to: '/',
    display: 'Home',
  },
  myPins: {
    icon: <AccountCircleIcon fontSize="medium" />,
    to: '/pins',
    display: 'My Pins',
  },
  users: {
    icon: <PeopleAltOutlinedIcon fontSize="medium" />,
    to: pathname.includes('profile') ? pathname : '/profile/63acc05f21481fa569a03b0b',
    display: 'Users',
  },
  logout: {
    icon: <LogoutIcon fontSize="medium" />,
    to: '/logout',
    display: 'Logout',
  },
});

type menuItemsObject = ReturnType<typeof getMenuItems>;

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

  const menuItems: menuItemsObject = useMemo(
    () => getMenuItems(pathname),
    [pathname],
  );

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
    >
      <MenuList>
        {
          Object.keys(menuItems).map((menu) => {
            const menuItem = menu as keyof menuItemsObject;
            return (
              <MenuItem
                component={NavLink}
                to={menuItems[menuItem].to}
                key={menu}
              >
                <ListItemIcon>
                  {menuItems[menuItem].icon}
                </ListItemIcon>
                <ListItemText
                  sx={{ color: pathname === menuItems[menuItem].to ? '#b20e0e' : '#5e6870' }}
                  primaryTypographyProps={{ ...ListItemTextStyling }}
                >
                  {menuItems[menuItem].display}
                </ListItemText>
              </MenuItem>
            );
          })
        }
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
