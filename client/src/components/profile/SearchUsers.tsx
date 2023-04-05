import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import ListItemText from '@mui/material/ListItemText';
import { getProviderIcons, UserListItem } from '../common/common';
import { providerIconsType } from '../../interfaces';
import RESTcall from '../../crud';

const providerIcons: providerIconsType = getProviderIcons({ fontSize: 20 });

interface SearchUsersProps {
  closeSearch: () => void
  authenticated: boolean
}

interface FoundUser {
  displayName: string,
  service: string,
  _id: string
}

type FoundUsers = FoundUser[] | []

function SearchUser({ closeSearch, authenticated }: SearchUsersProps) {
  const [searchVal, setSearchVal] = useState('');
  const [foundUsers, setFoundUsers] = useState([] as FoundUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(false);

  const history = useHistory();

  const handleSearch = async () => {
    let data: FoundUsers = [];
    if (searchVal.trim().length) {
      data = await RESTcall({ address: `/api/searchUser/${searchVal}` });
    }
    // clear out input if no users found
    if (!data.length) {
      setSearchVal('');
    }
    setFoundUsers(data);
    setTriggerSearch(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (triggerSearch) {
      handleSearch();
    }
  }, [triggerSearch]);

  const onDebounceSearch = useMemo(() => _.debounce(() => setTriggerSearch(true), 1000), []);

  const handleKeyUp = (e: React.KeyboardEvent) => {
    const { key } = e;
    switch (key) {
      case 'ArrowDown':
        return;
      case 'ArrowUp':
        return;
      default:
        setFoundUsers([]);
        setIsLoading(true);
        onDebounceSearch();
    }
  };

  const handleSelection = (e: React.SyntheticEvent, value: FoundUser | string, reason: string) => {
    // disable create option on enter
    if (reason === 'createOption' || typeof value === 'string') {
      setSearchVal('');
      return;
    }
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
        getOptionLabel={(option) => {
          if (typeof option === 'string') return '';
          return option.displayName;
        }}
        fullWidth
        disableClearable
        inputValue={searchVal}
        onInputChange={(e, value) => setSearchVal(value)}
        onChange={handleSelection}
        onKeyUp={handleKeyUp}
        loading={isLoading}
        autoComplete
        renderOption={
          (props, option) => (
            typeof option === 'string' ? null
              : (
                <UserListItem
                  profileLinkProps={{
                    authenticated,
                    userId: option._id,
                    title: <ListItemText
                      primary={option.displayName}
                      primaryTypographyProps={{ color: '#3752ff', fontWeight: 'bold' }}
                    />,
                    closePin: closeSearch,
                    displayLogin: () => null, // since an unauthenitaced user can not reach here
                  }}
                  providerIcons={providerIcons}
                  key={option._id}
                  service={option.service}
                  additionalProps={props}
                />
              )
          )
        }
        renderInput={(params) => (
          <InputBase
            {...params.InputProps}
            sx={{ width: '100%', height: '100%', marginLeft: 1 }}
            placeholder="Search users..."
            inputProps={{
              ...params.inputProps,
              onKeyDown: (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              },
            }}
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
