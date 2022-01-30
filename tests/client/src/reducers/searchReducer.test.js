import searchReducer from '../../../../client/src/reducers/searchReducer';

describe('The user reducer', () => {
  test('will return the payload for UPDATE_SEARCH action', () => {
    const action = { type: 'UPDATE_SEARCH', payload: 'search payload' };
    const newState = searchReducer(undefined, action);
    expect(newState).toBe('search payload');
  });

  test('will return the state for any other action', () => {
    const action = { type: 'ANY_OTHER', payload: 'any payload' };
    const newState = searchReducer(undefined, action);
    expect(newState).toEqual(null);
  });
});
