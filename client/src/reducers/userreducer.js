// sets user status into store state
const userStatusReducer = (state = { }, action) => {
  switch (action.type) {
    case 'GET_USER_STATUS':
      return action.payload;
    case 'SET_GUEST_STATUS':
      return action.payload;
    default:
      return state;
  }
};

export default userStatusReducer;
