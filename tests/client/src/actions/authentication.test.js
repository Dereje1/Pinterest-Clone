import { getUser, setGuest } from '../../../../client/src/actions/authentication';
//

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
        displayname: 'Tester displayName',
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
    const profile = getUser();
    await profile(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      payload: Error('Auth request rejected'),
      type: 'GET_USER_STATUS_REJECTED',
    });
  });

  test('will dispatch the status for a rejected guest user request', async () => {
    const profile = setGuest();
    await profile(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      payload: Error('Auth request rejected'),
      type: 'SET_GUEST_STATUS_REJECTED',
    });
  });
});
