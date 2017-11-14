"use strict"//unifies all reducers
import {combineReducers} from 'redux';

// HERE IMPORT REDUCERS TO BE COMBINED
import {userStatusReducer} from './userreducer';

//HERE COMBINE THE REDUCERS
export default combineReducers({
  user: userStatusReducer
})
