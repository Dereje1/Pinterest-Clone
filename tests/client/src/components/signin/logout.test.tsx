/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import LogOut from '../../../../../client/src/components/signin/logout';

const windowSpy = jest.spyOn(window, 'location', 'get');
const mockedAssign: jest.Mock = jest.fn();
windowSpy.mockReturnValue({
  ...window.location,
  assign: mockedAssign,
});

test('will logout a user', () => {
  shallow(<LogOut />);
  expect(mockedAssign).toHaveBeenCalledWith('/auth/logout');
});
