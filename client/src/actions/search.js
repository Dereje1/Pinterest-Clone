const updateSearch = val => ({
  type: 'UPDATE_SEARCH',
  payload: val.trim().length ? val.trim().toLowerCase() : null,
});

export default updateSearch;
