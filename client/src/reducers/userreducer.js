// sets user status into store state
const userStatusReducer = (state = { user: [] }, action) => {
  switch (action.type) {
    case 'GET_USER_STATUS':
      return { user: action.payload };
    case 'SET_GUEST_STATUS':
      return { user: action.payload };
    default:
      return state;
  }
};

export default userStatusReducer;
