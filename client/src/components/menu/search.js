import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const Search = ({
  searchUpdate,
  pathname,
}) => {
  const [searchVal, updateSearchVal] = useState('');

  const clearSearch = () => {
    updateSearchVal('');
    searchUpdate('');
  };

  const onSearch = _.debounce((val, reduxUpdate) => reduxUpdate(val), 500);

  const handleSearch = ({ target: { value } }) => {
    updateSearchVal(value);
    onSearch(value, searchUpdate);
  };

  if (pathname !== '/') return null;

  return (
    <Paper
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'start',
        width: '40%',
        height: '80%',
        background: '#f8f8f8',
      }}
      variant="string"
    >
      {searchVal
        ? (
          <HighlightOffIcon
            id="clear-search"
            style={{ fontSize: '1.5em', cursor: 'pointer' }}
            onClick={clearSearch}
          />
        ) : (
          <Tooltip title="Search by description or owner" placement="bottom">
            <SearchIcon />
          </Tooltip>
        )
      }
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search..."
        inputProps={{ 'aria-label': 'search' }}
        onChange={handleSearch}
        value={searchVal}
      />
    </Paper>
  );
};

export default Search;

Search.propTypes = {
  searchUpdate: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
};
