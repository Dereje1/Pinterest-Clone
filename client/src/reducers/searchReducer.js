// sets user status into store state
const searchReducer = (state = null, action) => {
  switch (action.type) {
    case 'UPDATE_SEARCH':
      return action.payload;
    default:
      return state;
  }
};

export default searchReducer;
