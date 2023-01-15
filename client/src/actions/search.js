const updateSearch = (val, tagSearch = false) => ({
  type: 'UPDATE_SEARCH',
  payload: {
    term: val.trim().length ? val.trim().toLowerCase() : null,
    tagSearch,
  },
});

export default updateSearch;
