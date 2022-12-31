import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

const Search = ({
  searchUpdate,
  pathname,
  isShowing,
  openSearch,
  closeSearch,
}) => {
  const [searchVal, updateSearchVal] = useState('');

  const clearSearch = () => {
    updateSearchVal('');
    searchUpdate('');
  };

  const onDebounceSearch = _.debounce((val, reduxUpdate) => reduxUpdate(val), 500);

  const handleSearch = ({ target: { value } }) => {
    updateSearchVal(value);
    onDebounceSearch(value, searchUpdate);
  };

  if (pathname === '/pins') return null;

  if (!isShowing) {
    return (
      <div className="search">
        <Tooltip title="Search by description or owner" placement="bottom">
          <SearchIcon
            onClick={openSearch}
            sx={{ cursor: 'pointer', justifySelf: 'flex-end' }}
            fontSize="large"
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >

      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: 360,
          marginTop: 'auto',
          marginBottom: 'auto',
        }}
        variant="string"
      >
        <IconButton
          sx={{ p: '10px' }}
          aria-label="menu"
          id="back"
          onClick={() => {
            clearSearch();
            closeSearch();
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <InputBase
          sx={{ width: '100%', height: '100%' }}
          placeholder="Search..."
          inputProps={{ 'aria-label': 'search' }}
          onChange={handleSearch}
          value={searchVal}
          autoFocus
        />
        <IconButton
          type="button"
          id="clear-search"
          sx={{
            p: '10px',
            cursor: 'pointer',
            visibility: searchVal ? 'visible' : 'hidden',
          }}
          onClick={clearSearch}
        >
          <HighlightOffIcon />
        </IconButton>
      </Paper>

    </div>

  );
};

export default Search;

Search.propTypes = {
  searchUpdate: PropTypes.func.isRequired,
  openSearch: PropTypes.func.isRequired,
  closeSearch: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  isShowing: PropTypes.bool.isRequired,
};
