/**
 * @jest-environment jsdom
 */

/*
 Note this test file is only used for fully mounting react components that are wrapped in
 the redux provider and router to assert that they can be mounted without error
 */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../../../../client/src/store';
import Search from '../../../../client/src/components/menu/search';
import Profile from '../../../../client/src/components/profile/Profile';

xtest('Will render fully mounted search component wrapped in the redux provider without errors', () => {
  const props = {
    searchUpdate: jest.fn(),
    pathname: '/',
    isShowing: false,
    openSearch: jest.fn(),
    closeSearch: jest.fn(),
  };
  mount(
    <Provider store={store}>
      <Search {...props} />
    </Provider>,
  );
});

xtest('Will render fully mounted Profile component wrapped in the redux provider without errors', async () => {
  mount(
    <Provider store={store}>
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    </Provider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
});
