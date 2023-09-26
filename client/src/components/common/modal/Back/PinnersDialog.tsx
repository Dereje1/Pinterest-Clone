import * as React from 'react';
import List from '@mui/material/List';
import Dialog from '@mui/material/Dialog';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemText from '@mui/material/ListItemText';
import { getProviderIcons, UserListItem } from '../../common';
import { providerIconsType, PinnerType } from '../../../../interfaces';

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
          <UserListItem
            profileLinkProps={{
              authenticated,
              userId: pinner.userId,
              title: <ListItemText
                primary={pinner.name}
                primaryTypographyProps={{ color: '#3752ff', fontWeight: 'bold' }}
              />,
              closePin: handleCose,
              displayLogin,
            }}
            providerIcons={providerIcons}
            key={pinner.userId}
            service={pinner.service}
          />
        ))}
      </List>
    </Dialog>
  );
}

export default PinnersDialog;
