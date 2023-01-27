import React, { useEffect, useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Tooltip from '@mui/material/Tooltip';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { searchType } from '../../interfaces';

interface SearchProps {
  pathname: string
  isShowing: boolean
  searchUpdate: (val: string) => void
  openSearch: () => void
  closeSearch: () => void
}

function Search({
  pathname,
  isShowing,
  searchUpdate,
  openSearch,
  closeSearch,
}: SearchProps) {
  const [searchVal, updateSearchVal] = useState('');
  const [scrollUp, setScrollUp] = useState(false);

  const { term, tagSearch } = useSelector(({ search }: {search: searchType}) => search);

  const onDebounceSearch = _.debounce((
    val: string,
    reduxUpdate,
  ) => reduxUpdate(val), 500);

  const handleSearch = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    const { value } = target;
    updateSearchVal(value);
    onDebounceSearch(value, searchUpdate);
  };

  const clearSearch = () => {
    updateSearchVal('');
    searchUpdate('');
  };

  useEffect(() => {
    if (tagSearch && term) {
      setScrollUp(true);
      openSearch();
      updateSearchVal(term);
      onDebounceSearch(term, searchUpdate);
    }
    return () => {
      setScrollUp(false);
    };
  }, [tagSearch]);

  useEffect(() => {
    if (pathname !== '/') closeSearch();
    if (pathname === '/' && Boolean(searchVal)) openSearch();
  }, [pathname]);

  useLayoutEffect(() => {
    if (scrollUp) {
      document.body.style.overflowY = 'scroll';
      window.scrollTo(0, 0);
    }
  });

  if (pathname !== '/') return null;

  if (!isShowing) {
    return (
      <div className="search">
        <Tooltip title="Search by description, owner or tags" placement="bottom">
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
        variant="elevation"
        elevation={3}
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
          sx={{ width: '100%', height: '100%', marginLeft: 1 }}
          placeholder="Search..."
          inputProps={{ 'aria-label': 'search' }}
          onChange={handleSearch}
          value={searchVal}
          autoFocus={!tagSearch}
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
}

export default Search;

Search.propTypes = {
  searchUpdate: PropTypes.func.isRequired,
  openSearch: PropTypes.func.isRequired,
  closeSearch: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  isShowing: PropTypes.bool.isRequired,
};
