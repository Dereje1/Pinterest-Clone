/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order */
/* eslint-disable import/first */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Profile from '../../../../../client/src/components/profile/Profile';
import * as redux from 'react-redux';
import * as router from 'react-router-dom';
import RESTcall from '../../../../../client/src/crud';

// Mock router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    userInfo: 'stubId-twitter-stubName',
  }),
  useLocation: () => ({ pathname: '/stub-path-name' }),
  useHistory: jest.fn(),
}));

// Mock redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'), // use actual for all non-hook parts
  useSelector: jest.fn((() => ({ authenticated: true }))),
}));

// Mock REST calls
jest.mock('../../../../../client/src/crud');
const mockedRESTcall = jest.mocked(RESTcall);

describe('The profile page', () => {
  afterEach(() => {
    mockedRESTcall.mockClear();
  });
  test('Will render for pins created by the user', async () => {
    const wrapper = shallow(<Profile />);
    await Promise.resolve();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Will render for pins saved by the user', async () => {
    const wrapper = shallow(<Profile />);
    await Promise.resolve();
    const selector: EnzymePropSelector = wrapper.find('UserPinsSelector');
    selector.props().setDisplaySetting('saved');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Will render signin for non-authenticated users', async () => {
    // Mock redux hooks
    jest
      .spyOn(redux, 'useSelector')
      .mockImplementationOnce(() => ({ authenticated: false }));
    const wrapper = shallow(<Profile />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Will render no image sign if user has not pinned or created any', async () => {
    mockedRESTcall.mockImplementationOnce(() => Promise.resolve({
      createdPins: [],
      savedPins: [],
      user: {
        userId: 'stubId', service: 'twitter', displayName: 'stubName',
      },
    }));
    const wrapper = shallow(<Profile />);
    await Promise.resolve();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Will redirect to server response if query can not be handled', async () => {
    const push = jest.fn();
    const hist = router.useHistory();
    jest
      .spyOn(router, 'useHistory')
      .mockImplementation(() => ({ ...hist, push }));
    mockedRESTcall.mockImplementationOnce(() => Promise.resolve({ redirect: '/serverresponse' }));
    shallow(<Profile />);
    await Promise.resolve();
    expect(push).toHaveBeenCalledWith('/serverresponse');
  });

  test('Will redirect to root if user chooses not to sign in', async () => {
    const push = jest.fn();
    const hist = router.useHistory();
    jest
      .spyOn(router, 'useHistory')
      .mockImplementation(() => ({ ...hist, push }));
    jest
      .spyOn(redux, 'useSelector')
      .mockImplementationOnce(() => ({ authenticated: false }));
    const wrapper = shallow(<Profile />);
    const signin: EnzymePropSelector = wrapper.find('SignIn');
    signin.props().removeSignin();
    expect(push).toHaveBeenCalledWith('/');
  });

  test('Will not render loading if not ready or REST call is rejected', async () => {
    mockedRESTcall.mockImplementationOnce(() => Promise.reject());
    const wrapper = shallow(<Profile />);
    await Promise.resolve();
    expect(wrapper.find('Loading').length).toBe(1);
  });
});
