import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

  if (pathname !== '/') return null;

  if (!isShowing) {
    return (
      <div className="search">
        <Tooltip title="Search by description or owner" placement="bottom">
          <SearchIcon
            onClick={openSearch}
            sx={{ fontSize: 35, cursor: 'pointer', justifySelf: 'flex-end' }}
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
      <ArrowBackIcon
        onClick={() => {
          clearSearch();
          closeSearch();
        }}
        sx={{ fontSize: 35, cursor: 'pointer' }}
      />

      <Paper
        sx={{
          p: '2px 4px',
          background: 'white',
          height: '50px',
          width: '200px',
          marginLeft: 3,
          marginRight: 3,
        }}
        variant="string"
      >
        <InputBase
          sx={{ width: '100%', height: '100%' }}
          placeholder="Search..."
          inputProps={{ 'aria-label': 'search' }}
          onChange={handleSearch}
          value={searchVal}
        />
      </Paper>

      <HighlightOffIcon
        id="clear-search"
        style={{
          fontSize: 35,
          cursor: 'pointer',
          visibility: searchVal ? 'visible' : 'hidden',
        }}
        onClick={clearSearch}
      />
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
