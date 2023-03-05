import userStatusReducer from '../../../../client/src/reducers/userreducer';
import { reduxStub } from '../../stub';

describe('The user reducer', () => {
  test('will return the payload for GET_USER_STATUS action', () => {
    const action = { type: 'GET_USER_STATUS', payload: reduxStub.user };
    const newState = userStatusReducer({ }, action);
    expect(newState).toBe(reduxStub.user);
  });

  test('will return the payload for SET_GUEST_STATUS action', () => {
    const action = { type: 'SET_GUEST_STATUS', payload: reduxStub.user };
    const newState = userStatusReducer({ }, action);
    expect(newState).toBe(reduxStub.user);
  });

  test('will return the state for any other action', () => {
    const action = { type: 'ANY_OTHER', payload: reduxStub.user };
    const newState = userStatusReducer(undefined, action);
    expect(newState).toEqual({});
  });
});
