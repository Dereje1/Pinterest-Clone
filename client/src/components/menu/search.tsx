import React, {
  useEffect, useState, useLayoutEffect, useMemo,
} from 'react';
import _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { updateSearch } from '../../redux/searchSlice';
import { searchType } from '../../interfaces';

interface SearchProps {
  pathname: string
  isShowing: boolean
  openSearch: () => void
  closeSearch: () => void
}

function Search({
  pathname,
  isShowing,
  openSearch,
  closeSearch,
}: SearchProps) {
  const [searchVal, updateSearchVal] = useState('');
  const [scrollUp, setScrollUp] = useState(false);
  const [triggerDispatch, setTriggerDispatch] = useState(false);

  const dispatch = useDispatch();
  const { term, tagSearch } = useSelector(({ search }: {search: searchType}) => search);

  const onDebounceSearch = useMemo(
    () => _.debounce(() => setTriggerDispatch(true), 500),
    [],
  );

  useEffect(() => {
    if (triggerDispatch) {
      dispatch(updateSearch(searchVal));
      setTriggerDispatch(false);
    }
  }, [triggerDispatch]);

  const handleSearch = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    const { value } = target;
    updateSearchVal(value);
    onDebounceSearch();
  };

  const clearSearch = () => {
    updateSearchVal('');
    dispatch(updateSearch(''));
  };

  useEffect(() => {
    if (tagSearch && term) {
      setScrollUp(true);
      openSearch();
      updateSearchVal(term);
      dispatch(updateSearch(term));
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
    return null;
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
          placeholder="Search by description, owner or tags..."
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
