import searchReducer from '../../../../client/src/reducers/searchReducer';

describe('The user reducer', () => {
  test('will return the payload for UPDATE_SEARCH action', () => {
    const action = {
      type: 'UPDATE_SEARCH',
      payload: {
        term: 'mock term',
        tagSearch: false,
      },
    };
    const newState = searchReducer(undefined, action);
    expect(newState).toBe(action.payload);
  });

  test('will return the state for any other action', () => {
    const action = {
      type: 'ANY_OTHER',
      payload: {
        term: 'mock term',
        tagSearch: false,
      },
    };
    const newState = searchReducer(undefined, action);
    expect(newState).toEqual({ tagSearch: false, term: null });
  });
});
