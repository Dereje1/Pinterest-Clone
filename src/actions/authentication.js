// only getuser action dispatches to store
import axios from 'axios';

// action gets user authentication status from /profile that is generated
// and updates store
export const getUser = () => dispatch => (
  axios.get('/profile')
    .then((response) => {
      dispatch({
        type: 'GET_USER_STATUS',
        payload: response.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: 'GET_USER_STATUS_REJECTED',
        payload: err,
      });
    })
);

// fake guest account setter look at backend /authconfig/routes
export const setGuest = () => dispatch => (
  axios.get('/guest')
    .then((response) => {
      dispatch({
        type: 'SET_GUEST_STATUS',
        payload: response.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: 'SET_GUEST_STATUS_REJECTED',
        payload: err,
      });
    })
);
