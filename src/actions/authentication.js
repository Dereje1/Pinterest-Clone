"use strict" //only getuser action dispatches to store
import axios from 'axios';

export function getUser(){
  // action gets user authentication status from /profile that is generated
  //and updates store
  return function (dispatch){
    axios.get('/profile')
      .then(function(response){
          dispatch(
              {
                type:"GET_USER_STATUS",
                payload:response.data
              }
            )
        })
      .catch(function(err){
        dispatch({type:"GET_USER_STATUS_REJECTED",payload:err})
      })
    }
}

export function setGuest(){
  // fake guest account setter look at backend /authconfig/routes
  return function (dispatch){
    axios.get('/guest')
      .then(function(response){
          dispatch(
              {
                type:"SET_GUEST_STATUS",
                payload:response.data
              }
            )
        })
      .catch(function(err){
        dispatch({type:"SET_GUEST_STATUS_REJECTED",payload:err})
      })
    }
}
