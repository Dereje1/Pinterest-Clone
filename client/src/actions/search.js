export const updateSearch = val => ({
  type: 'UPDATE_SEARCH',
  payload: val.trim().length ? val.toLowerCase() : null,
});
