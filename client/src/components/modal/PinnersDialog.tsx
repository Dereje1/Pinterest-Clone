import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import ListSubheader from '@mui/material/ListSubheader';
import { getProviderIcons } from '../common/common';
import ProfileLink from './ProfileLink';
import { providerIconsType, PinnerType } from '../../interfaces';

const providerIcons: providerIconsType = getProviderIcons({ fontSize: 20 });

interface PinnersDialogProps {
  onCloseDialog: () => void
  onClosePin: (_: React.SyntheticEvent, forceClose?: boolean) => void
  open: boolean
  pinnersList: PinnerType[]
  displayLogin: () => void
  authenticated: boolean
}

function PinnersDialog({
  onCloseDialog,
  onClosePin,
  open,
  pinnersList,
  authenticated,
  displayLogin,
}:PinnersDialogProps) {
  const handleCose = (e: React.SyntheticEvent) => {
    onCloseDialog();
    onClosePin(e);
  };

  return (
    <Dialog
      onClose={onCloseDialog}
      open={open}
      PaperProps={{ sx: { position: 'fixed', top: 0 } }}
      disableAutoFocus
    >
      <List
        sx={{ pt: 0 }}
        subheader={<ListSubheader sx={{ textAlign: 'center' }}>Pinners</ListSubheader>}
      >
        {pinnersList.map((pinner) => (
          <ListItem
            key={pinner.userId}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  width: 26,
                  height: 26,
                  bgcolor: providerIcons[pinner.service as keyof providerIconsType].color,
                }}
              >
                {providerIcons[pinner.service as keyof providerIconsType].icon}
              </Avatar>
            </ListItemAvatar>
            <ProfileLink
              authenticated={authenticated}
              closePin={handleCose}
              userId={pinner.userId}
              title={<ListItemText primary={pinner.name} />}
              displayLogin={displayLogin}
            />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

export default PinnersDialog;
