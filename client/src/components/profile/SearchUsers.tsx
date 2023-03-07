import React, { useState } from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import { getProviderIcons } from '../common/common';
import ProfileLink from '../modal/ProfileLink';
import { providerIconsType } from '../../interfaces';
import RESTcall from '../../crud';

const providerIcons: providerIconsType = getProviderIcons({ fontSize: 20 });

interface SearchUsersProps {
  closeSearch: () => void
  authenticated: boolean
  displayLogin: () => void
}

interface FoundUser {
  displayName: string,
  service: string,
  _id: string
}

type FoundUsers = FoundUser[] | []

function SearchUser({ closeSearch, displayLogin, authenticated }: SearchUsersProps) {
  const [searchVal, setSearchVal] = useState('');
  const [foundUsers, setFoundUsers] = useState([] as FoundUsers);
  const [isLoading, setIsLoading] = useState(false);

  const history = useHistory();

  const handleSearch = async () => {
    if (searchVal.trim().length) {
      const data: FoundUsers = await RESTcall({ address: `/api/searchUser/${searchVal}` });
      setFoundUsers(data);
      setIsLoading(false);
    } else {
      setFoundUsers([]);
      setIsLoading(false);
    }
  };

  const onDebounceSearch = _.debounce(handleSearch, 1000);

  const handleKeyUp = () => {
    setIsLoading(true);
    onDebounceSearch();
  };

  const handleSelection = (e: React.SyntheticEvent, value: FoundUser) => {
    closeSearch();
    history.push(`/profile/${value._id}`);
  };

  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 300,
        marginTop: 'auto',
        marginBottom: 'auto',
      }}
      variant="elevation"
      elevation={2}
    >
      <Autocomplete
        id="free-solo-user-search"
        freeSolo
        options={foundUsers}
        getOptionLabel={(option: FoundUser) => option.displayName}
        fullWidth
        disableClearable
        inputValue={searchVal}
        onInputChange={(e, value) => setSearchVal(value)}
        onChange={handleSelection}
        onKeyUp={handleKeyUp}
        loading={isLoading}
        renderOption={
          (props, option) => (
            <ListItem
              {...props}
              key={option._id}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 26,
                    height: 26,
                    bgcolor: providerIcons[option.service as keyof providerIconsType].color,
                  }}
                >
                  {providerIcons[option.service as keyof providerIconsType].icon}
                </Avatar>
              </ListItemAvatar>
              <ProfileLink
                authenticated={authenticated}
                closePin={closeSearch}
                userId={option._id}
                title={(
                  <ListItemText
                    primary={option.displayName}
                    primaryTypographyProps={{ color: '#3752ff', fontWeight: 'bold' }}
                  />
                )}
                displayLogin={displayLogin}
              />
            </ListItem>
          )
        }
        renderInput={(params) => (
          <InputBase
            {...params.InputProps}
            sx={{ width: '100%', height: '100%', marginLeft: 1 }}
            placeholder="Search users..."
            inputProps={{ ...params.inputProps }}
          />
        )}
      />

      <IconButton
        type="button"
        id="clear-search"
        sx={{
          p: '10px',
          cursor: 'pointer',
        }}
        onClick={closeSearch}
      >
        <HighlightOffIcon />
      </IconButton>
    </Paper>
  );
}

export default SearchUser;
