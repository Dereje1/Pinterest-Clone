// only getuser action dispatches to store
import RESTcall from '../crud';
import { userType } from '../interfaces';

// action gets user authentication status from /profile that is generated
// and updates store
interface dispatchType {
    type: string,
    payload: userType
}

export const getUser = (path: string) => async (dispatch: (action: dispatchType) => void) => {
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
export const setGuest = (path: string) => async (dispatch: (action: dispatchType) => void) => {
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
  }
};

export const updateDisplayName = (newName: string) => ({
  type: 'UPDATE_DISPLAY_NAME',
  payload: newName,
});
