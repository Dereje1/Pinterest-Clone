import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import { getProviderIcons } from '../common/common';
import {
  providerIconsType,
} from '../../interfaces';

const providerIcons = getProviderIcons({ fontSize: 45 });

interface getUserInfoProps {
  user:{
    service: string
    displayName: string | null
    username: string | null
  }
  showNameChangeForm: ()=> void
  nameChangeFormIsShowing: boolean
  submitNameChange: (newName: string)=>void
}

interface NameChangeFormProps {
    submitNameChange: (newName: string)=>void
    oldDisplayName: string | null,
  }

export function NameChangeForm({ submitNameChange, oldDisplayName }: NameChangeFormProps) {
  const [nameValue, setNameValue] = useState(oldDisplayName || '');

  const handleNameChange = (e: React.SyntheticEvent, isCancelled = false) => {
    if (!isCancelled) {
      submitNameChange(nameValue.trim());
    } else {
      submitNameChange('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <TextField
        variant="standard"
        value={nameValue}
        onChange={({ target: { value } }) => setNameValue(value)}
        error={nameValue.trim().length > 15}
        sx={{ width: 150, mb: 1 }}
        InputProps={{
          inputProps: {
            style: { textAlign: 'center' },
          },
        }}
      />
      <div style={{
        display: 'flex', justifyContent: 'space-around', width: 150,
      }}
      >
        <IconButton onClick={handleNameChange}>
          <DoneIcon
            color="success"
          />
        </IconButton>
        <IconButton onClick={(_) => handleNameChange(_, true)}>
          <CancelIcon
            color="error"
          />
        </IconButton>
      </div>
    </div>
  );
}

function UserInfo({
  user, nameChangeFormIsShowing, showNameChangeForm, submitNameChange,
}: getUserInfoProps) {
  const { service, displayName, username } = user;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    >
      <Avatar sx={{
        mb: 2,
        width: 52,
        height: 52,
        bgcolor: providerIcons[service as keyof providerIconsType].color,
      }}
      >
        {providerIcons[service as keyof providerIconsType].icon}
      </Avatar>
      <div style={{ display: 'flex', alignItems: 'center', height: 75 }}>
        {nameChangeFormIsShowing ? (
          <NameChangeForm
            submitNameChange={submitNameChange}
            oldDisplayName={displayName}
          />
        ) : (
          <>
            <Typography variant="h5" sx={{ paddingLeft: 8 }}>
              {displayName}
            </Typography>
            <IconButton onClick={showNameChangeForm} sx={{ ml: 2 }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </div>
      <Typography style={{ marginLeft: 15, marginTop: 4 }}>
        {service === 'google' ? username : `@${username}`}
      </Typography>
    </div>
  );
}

export default UserInfo;
