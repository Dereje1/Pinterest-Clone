import RESTcall from '../crud';
import { userType } from '../interfaces';

interface dispatchType {
    type: string,
    payload: userType | unknown
}

export const getUser = (address: string) => async (dispatch: (action: dispatchType) => void) => {
  try {
    const payload = await RESTcall({ address });
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
export const setGuest = (address: string) => async (dispatch: (action: dispatchType) => void) => {
  try {
    const payload = await RESTcall({ address });
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
