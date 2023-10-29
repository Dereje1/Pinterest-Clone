import searchReducer, { updateSearch } from '../../../../client/src/redux/searchSlice';

describe('The user reducer', () => {
  test('will return the payload for UPDATE_SEARCH action', () => {
    const action = {
      type: 'search/updateSearch',
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
    expect(newState).toEqual({ tagSearch: false, term: null, sort: false });
  });
});

describe('search actions', () => {
  test('will send the full search term as payload', () => {
    const action = updateSearch('ABC');
    expect(action).toEqual({
      type: 'search/updateSearch',
      payload: {
        term: 'abc',
        tagSearch: false,
        sort: false,
      },
    });
  });
  test('will send null for an empty search term', () => {
    const action = updateSearch('    ');
    expect(action).toEqual({
      type: 'search/updateSearch',
      payload: {
        term: null,
        tagSearch: false,
        sort: false,
      },
    });
  });
});
