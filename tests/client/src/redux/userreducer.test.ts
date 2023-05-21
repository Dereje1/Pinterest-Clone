import userStatusReducer, { updateDisplayName, getUser, setGuest } from '../../../../client/src/redux/userSlice';
import { reduxStub } from '../../stub';

jest.mock('../../../../client/src/crud');

const initialState = {
  authenticated: false,
  userId: '',
  userIp: '',
  username: null,
  displayName: null,
  service: '',
  createdAt: '',
};

describe('The user reducer', () => {
  test('will return the payload for GET_USER_STATUS action', () => {
    const action = { type: 'user/getUserStatus', payload: reduxStub.user };
    const newState = userStatusReducer(initialState, action);
    expect(newState).toBe(reduxStub.user);
  });

  test('will return the payload for SET_GUEST_STATUS action', () => {
    const action = { type: 'user/setGuestStatus', payload: reduxStub.user };
    const newState = userStatusReducer(initialState, action);
    expect(newState).toBe(reduxStub.user);
  });

  test('will return the initial state for a rejected auth call', () => {
    const action = { type: 'user/rejectAuthentication', payload: reduxStub.user };
    const newState = userStatusReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });

  test('will update the display name', () => {
    const action = { type: 'user/setGuestStatus', payload: reduxStub.user };
    const newState = userStatusReducer(initialState, action);
    expect(newState).toBe(reduxStub.user);
    // send action to update dispalay name
    const newStateWithDisplayNameChange = userStatusReducer(newState, updateDisplayName('new display name'));
    expect(newStateWithDisplayNameChange).toEqual({ ...reduxStub.user, displayName: 'new display name' });
  });

  test('will return the state for any other action', () => {
    const action = { type: 'ANY_OTHER', payload: reduxStub.user };
    const newState = userStatusReducer(undefined, action);
    expect(newState).toEqual(initialState);
  });
});

describe('Authentication actions', () => {
  let dispatch: jest.Mock;
  beforeEach(() => {
    dispatch = jest.fn();
  });
  afterEach(() => {
    dispatch.mockClear();
  });
  test('will dispatch the status for a logged in user', async () => {
    const profile = getUser('/auth/profile');
    await profile(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        authenticated: true,
        userIp: 'Tester userIp',
        username: 'Tester username',
        userId: 'Tester userId',
        displayName: 'Tester displayName',
        service: 'twitter',
      },
      type: 'user/getUserStatus',
    });
  });

  test('will dispatch the status for a guest user', async () => {
    const profile = setGuest('/auth/guest');
    await profile(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        authenticated: false,
        userIp: 'Tester userIp',
        username: 'Tester guest',
      },
      type: 'user/setGuestStatus',
    });
  });

  test('will dispatch the status for a rejected logged in user request', async () => {
    const profile = getUser('profile_get_reject');
    await profile(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'user/rejectAuthentication',
    });
  });

  test('will dispatch the status for a rejected guest user request', async () => {
    const profile = setGuest('guest_get_reject');
    await profile(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'user/rejectAuthentication',
    });
  });
});
