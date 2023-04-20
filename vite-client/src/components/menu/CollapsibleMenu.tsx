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
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { getProviderIcons } from '../common/common';
import { providerIconsType } from '../../interfaces';

const ListItemTextStyling = { marginLeft: 5, fontSize: 20, fontWeight: 'bold' };

const providerIcons: providerIconsType = getProviderIcons({ fontSize: 24 });

const getMenuItems = (pathname: string, service: string) => ({
  home: {
    icon: <HomeIcon fontSize="medium" />,
    iconColor: '',
    to: '/',
    display: 'Home',
  },
  myPins: {
    icon: providerIcons[service as keyof providerIconsType].icon,
    iconColor: providerIcons[service as keyof providerIconsType].color,
    to: '/pins',
    display: 'Profile',
  },
  users: {
    icon: <PeopleAltOutlinedIcon fontSize="medium" />,
    iconColor: '',
    to: pathname.includes('profile') ? pathname : '/profile/63acc05f21481fa569a03b0b',
    display: 'Users',
  },
  search: {
    icon: <SearchIcon fontSize="medium" />,
    iconColor: '',
    to: '',
    display: 'Search',
  },
  logout: {
    icon: <LogoutIcon fontSize="medium" />,
    iconColor: '',
    to: '/logout',
    display: 'Logout',
  },
});

type menuItemsObject = ReturnType<typeof getMenuItems>;

interface CollapsibleMenuProps {
  pathname: string
  menuClicked: (e: React.SyntheticEvent) => void
  service: string
}

function CollapsibleMenu(
  { pathname, menuClicked, service }: CollapsibleMenuProps,
) {
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
    () => getMenuItems(pathname, service),
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
                onClick={menuClicked}
              >
                <ListItemIcon sx={{ color: menuItems[menuItem].iconColor }}>
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
        sx={{ marginLeft: 1, marginRight: 3, cursor: 'pointer' }}
      />
      <Drawer
        anchor={window.innerWidth < 750 ? 'top' : 'right'}
        open={openDrawer}
        onClose={toggleDrawer}
      >
        {list()}
      </Drawer>
    </div>
  );
}

export default CollapsibleMenu;
