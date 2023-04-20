// unifies all reducers
import { combineReducers } from 'redux';

// HERE IMPORT REDUCERS TO BE COMBINED
import userStatusReducer from './userreducer';
import searchReducer from './searchReducer';

// HERE COMBINE THE REDUCERS
export default combineReducers({
  user: userStatusReducer,
  search: searchReducer,
});
