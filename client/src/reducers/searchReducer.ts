/* eslint-disable default-param-last */
// sets user status into store state
import { searchType } from '../interfaces';

interface actionType {
  type: string,
  payload: searchType
}
const searchReducer = (state = { term: null, tagSearch: false }, action: actionType) => {
  switch (action.type) {
    case 'UPDATE_SEARCH':
      return action.payload;
    default:
      return state;
  }
};

export default searchReducer;
