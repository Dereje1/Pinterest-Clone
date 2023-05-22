import { createSlice } from '@reduxjs/toolkit';
import { searchType } from '../interfaces';

const initialState: searchType = { term: null, tagSearch: false };

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    updateSearch: (state, action) => action.payload,
  },
});

export const updateSearch = (val: string, tagSearch = false) => (
  searchSlice.actions.updateSearch({
    term: val.trim().length ? val.trim().toLowerCase() : null,
    tagSearch,
  })
);

export default searchSlice.reducer;
