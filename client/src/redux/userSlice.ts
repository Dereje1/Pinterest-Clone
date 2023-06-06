/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import RESTcall from '../crud';
import { userType } from '../interfaces';

const initialState: userType = {
  authenticated: false,
  userId: '',
  userIp: '',
  username: null,
  displayName: null,
  service: '',
  createdAt: '',
};

interface dispatchType {
  type: string,
  payload: userType | undefined
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getUserStatus: (state, action) => action.payload,
    setGuestStatus: (state, action) => action.payload,
    rejectAuthentication: () => initialState,
    changeDisplayName: (state, action) => {
      state.displayName = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
const {
  getUserStatus,
  setGuestStatus,
  changeDisplayName,
  rejectAuthentication,
} = userSlice.actions;

export const getUser = (address: string) => async (dispatch: (action: dispatchType) => void) => {
  try {
    const payload = await RESTcall({ address });
    dispatch(getUserStatus(payload));
  } catch (err) {
    dispatch(rejectAuthentication());
  }
};

// fake guest account setter look at backend /authconfig/routes
export const setGuest = (address: string) => async (dispatch: (action: dispatchType) => void) => {
  try {
    const payload = await RESTcall({ address });
    dispatch(setGuestStatus(payload));
  } catch (err) {
    dispatch(rejectAuthentication());
  }
};

export const updateDisplayName = (newName: string) => changeDisplayName(newName);

export default userSlice.reducer;
