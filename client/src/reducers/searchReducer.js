/* eslint-disable default-param-last */
// sets user status into store state
const searchReducer = (state = { term: null, tagSearch: false }, action) => {
  switch (action.type) {
    case 'UPDATE_SEARCH':
      return action.payload;
    default:
      return state;
  }
};

export default searchReducer;
