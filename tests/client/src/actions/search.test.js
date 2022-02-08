import updateSearch from '../../../../client/src/actions/search';

describe('Action to update search terms in redux', () => {
  test('will send the full search term as payload', () => {
    const action = updateSearch('ABC');
    expect(action).toEqual({
      type: 'UPDATE_SEARCH',
      payload: 'abc',
    });
  });
  test('will send null for an empty search term', () => {
    const action = updateSearch('    ');
    expect(action).toEqual({
      type: 'UPDATE_SEARCH',
      payload: null,
    });
  });
});
