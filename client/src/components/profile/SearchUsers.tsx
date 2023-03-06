import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import RESTcall from '../../crud';

interface SearchUsersProps {
  closeSearch: () => void
}

interface FoundUser {
  displayName: string,
  service: string,
  _id: string
}

type FoundUsers = FoundUser[] | []

function SearchUser({ closeSearch }: SearchUsersProps) {
  const [searchVal, setSearchVal] = useState('');
  const [foundUsers, setFoundUsers] = useState([] as FoundUsers);

  const handleSearch = async () => {
    if (searchVal.trim().length) {
      const data: FoundUsers = await RESTcall({ address: `/api/searchUser/${searchVal}` });
      setFoundUsers(data);
    } else {
      setFoundUsers([]);
    }
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
        id="free-solo-tags"
        freeSolo
        options={foundUsers}
        getOptionLabel={(option: FoundUser) => option.displayName}
        fullWidth
        disableClearable
        inputValue={searchVal}
        autoComplete
        onInputChange={(_, value) => setSearchVal(value)}
        onKeyUp={handleSearch}
        renderOption={
          (props, option) => (
            <li {...props} key={option._id}>
              {option.displayName}
            </li>
          )
        }
        renderInput={(params) => {
          const { InputLabelProps, InputProps, ...rest } = params;
          return (
            <InputBase
              {...InputProps}
              {...rest}
              sx={{ width: '100%', height: '100%', marginLeft: 1 }}
              placeholder="Search users..."
              inputProps={{ ...params.inputProps }}
            />
          );
        }}
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
