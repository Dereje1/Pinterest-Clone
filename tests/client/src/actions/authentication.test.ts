import { getUser, setGuest } from '../../../../client/src/actions/authentication';
//
jest.mock('../../../../client/src/crud');
describe('authentication', () => {
  let dispatch;
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
      type: 'GET_USER_STATUS',
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
      type: 'SET_GUEST_STATUS',
    });
  });

  test('will dispatch the status for a rejected logged in user request', async () => {
    const profile = getUser('profile_get_reject');
    await profile(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      payload: Error('Requested method:get and path: profile_get_reject not mocked!!'),
      type: 'GET_USER_STATUS_REJECTED',
    });
  });

  test('will dispatch the status for a rejected guest user request', async () => {
    const profile = setGuest('guest_get_reject');
    await profile(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      payload: Error('Requested method:get and path: guest_get_reject not mocked!!'),
      type: 'SET_GUEST_STATUS_REJECTED',
    });
  });
});
