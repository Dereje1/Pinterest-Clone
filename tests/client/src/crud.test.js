import crud from '../../../client/src/crud';

describe('generalized crud requests', () => {
  test('will make axios requests', async () => {
    const result = await crud({ address: '/successful' });
    expect(result).toEqual('data returned succesfully!');
  });

  test('will reject axios requests', async () => {
    try {
      await crud({ address: 'some_unrecognized_path' });
    } catch (error) {
      expect(error).toEqual(Error('Axios request rejected'));
    }
  });
});
