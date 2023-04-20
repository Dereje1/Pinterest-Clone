import React from 'react';
import { shallow } from 'enzyme';
import * as router from 'react-router-dom';
import LogOut from '../../../../../client/src/components/signin/logout';
import RESTcall from '../../../../../client/src/crud';

const mockdispatch = jest.fn();
// Mock RESTcall
jest.mock('../../../../../client/src/crud');
// Mock redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'), // use actual for all non-hook parts
  useDispatch: jest.fn(() => mockdispatch),
}));

// Mock router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useHistory: jest.fn(),
}));

xtest('will logout a user', async () => {
  const replace = jest.fn();
  const hist = router.useHistory();
  jest
    .spyOn(router, 'useHistory')
    .mockImplementation(() => ({ ...hist, replace }));
  shallow(<LogOut />);
  await Promise.resolve();
  expect(RESTcall).toHaveBeenCalledWith({ address: '/auth/logout' });
  expect(mockdispatch).toHaveBeenCalled();
  expect(replace).toHaveBeenCalledWith('/');
});
