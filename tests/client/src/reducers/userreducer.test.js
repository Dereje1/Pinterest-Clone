import userStatusReducer from '../../../../client/src/reducers/userreducer';

describe('The user reducer', () => {
  test('will return the payload for GET_USER_STATUS action', () => {
    const action = { type: 'GET_USER_STATUS', payload: 'user payload' };
    const newState = userStatusReducer(null, action);
    expect(newState).toBe('user payload');
  });

  test('will return the payload for SET_GUEST_STATUS action', () => {
    const action = { type: 'SET_GUEST_STATUS', payload: 'guest payload' };
    const newState = userStatusReducer(null, action);
    expect(newState).toBe('guest payload');
  });

  test('will return the state for any other action', () => {
    const action = { type: 'ANY_OTHER', payload: 'any payload' };
    const newState = userStatusReducer(undefined, action);
    expect(newState).toEqual({});
  });
});
