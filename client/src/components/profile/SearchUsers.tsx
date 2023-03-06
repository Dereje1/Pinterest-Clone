import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from '@mui/material/IconButton';
import RESTcall from '../../crud';

function SearchUser() {
  const [searchVal, updateSearchVal] = useState('');

  const handleSearch = async () => {
    if (searchVal.trim().length) {
      const data = await RESTcall({ address: `/api/searchUser/${searchVal}` });
      console.log({ data });
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
      elevation={3}
    >
      <InputBase
        sx={{ width: '100%', height: '100%', marginLeft: 1 }}
        placeholder="Search..."
        inputProps={{ 'aria-label': 'search' }}
        onChange={(e) => updateSearchVal(e.target.value)}
        onKeyUp={handleSearch}
        value={searchVal}
        autoFocus={false}
      />
      <IconButton
        type="button"
        id="clear-search"
        sx={{
          p: '10px',
          cursor: 'pointer',
          // visibility: searchVal ? 'visible' : 'hidden',
        }}
        onClick={() => ({})}
      >
        <HighlightOffIcon />
      </IconButton>
    </Paper>
  );
}

export default SearchUser;
