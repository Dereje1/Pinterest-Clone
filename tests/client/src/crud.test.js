import crud from '../../../client/src/crud';

describe('generalized crud requests', () => {
  test('will make axios requests', async () => {
    const result = await crud({ address: '/auth/profile' });
    expect(result).toEqual({
      authenticated: true,
      displayname: 'Tester displayName',
      service: 'twitter',
      userId: 'Tester userId',
      userIp: 'Tester userIp',
      username: 'Tester username',
    });
  });

  test('will reject axios requests', async () => {
    try {
      await crud({ address: 'some_unrecognized_path' });
    } catch (error) {
      expect(error).toEqual(Error('Auth request rejected'));
    }
  });
});
