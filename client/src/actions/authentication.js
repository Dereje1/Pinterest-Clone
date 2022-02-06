// only getuser action dispatches to store
import RESTcall from '../crud';

// action gets user authentication status from /profile that is generated
// and updates store
export const getUser = path => async (dispatch) => {
  try {
    const payload = await RESTcall({ address: path });
    dispatch({
      type: 'GET_USER_STATUS',
      payload,
    });
  } catch (err) {
    dispatch({
      type: 'GET_USER_STATUS_REJECTED',
      payload: err,
    });
  }
};

// fake guest account setter look at backend /authconfig/routes
export const setGuest = path => async (dispatch) => {
  try {
    const payload = await RESTcall({ address: path });
    dispatch({
      type: 'SET_GUEST_STATUS',
      payload,
    });
  } catch (err) {
    dispatch({
      type: 'SET_GUEST_STATUS_REJECTED',
      payload: err,
    });
  // }
  }
};
