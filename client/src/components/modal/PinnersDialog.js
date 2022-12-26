import * as React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import { blue } from '@mui/material/colors';


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
        <ListItem key={pinner.userId}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          <Link
            onClick={onClose}
            to={`/profile/${pinner.userId}-${pinner.service}-${pinner.name}`}
          >
            <ListItemText primary={pinner.name} />

          </Link>
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
