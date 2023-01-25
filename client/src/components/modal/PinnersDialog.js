import * as React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import ListSubheader from '@mui/material/ListSubheader';
import { getProviderIcons } from '../common/common.tsx';

const providerIcons = getProviderIcons({ fontSize: 20 });

function PinnersDialog({
  onCloseDialog, open, pinnersList, onClosePin,
}) {
  return (
    <Dialog
      onClose={onCloseDialog}
      open={open}
      PaperProps={{ sx: { position: 'fixed', top: 0 } }}
    >
      <List
        sx={{ pt: 0 }}
        subheader={<ListSubheader sx={{ textAlign: 'center' }}>Pinners</ListSubheader>}
      >
        {pinnersList.map((pinner) => (
          <ListItem
            onClick={() => { onCloseDialog(); onClosePin(); }}
            key={pinner.userId}
            component={Link}
            to={`/profile/${pinner.userId}-${pinner.service}-${pinner.name}`}
          >
            <ListItemAvatar>
              <Avatar sx={{ width: 26, height: 26, bgcolor: providerIcons[pinner.service].color }}>
                {providerIcons[pinner.service].icon}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={pinner.name} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

PinnersDialog.propTypes = {
  onCloseDialog: PropTypes.func.isRequired,
  onClosePin: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  pinnersList: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
};

export default PinnersDialog;
