import * as React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import TwitterIcon from '@mui/icons-material/Twitter';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';

const providerIcons = {
  twitter: { icon: <TwitterIcon style={{ fontSize: 20 }} />, color: '#1DA1F2' },
  google: { icon: <GoogleIcon style={{ fontSize: 20 }} />, color: '#4285F4' },
  github: { icon: <GitHubIcon style={{ fontSize: 20 }} />, color: '#1d7b20' },
};

const PinnersDialog = ({
  onClose, open, pinnersList,
}) => (
  <Dialog
    onClose={onClose}
    open={open}
    PaperProps={{ sx: { position: 'fixed', top: 0 } }}
  >
    <List sx={{ pt: 0 }}>
      {pinnersList.map(pinner => (
        <ListItem key={pinner.userId} component={Link} to={`/profile/${pinner.userId}-${pinner.service}-${pinner.name}`}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: providerIcons[pinner.service].color }}>
              {providerIcons[pinner.service].icon}
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={pinner.name} />
        </ListItem>
      ))}
    </List>
  </Dialog>
);

PinnersDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  pinnersList: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
};

export default PinnersDialog;
