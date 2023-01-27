/* eslint-disable default-param-last */
// sets user status into store state
import { userType } from '../interfaces';

interface actionType {
  type: string,
  payload: userType
}
const userStatusReducer = (state = { }, action: actionType) => {
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
