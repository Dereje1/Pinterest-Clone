/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order */
/* eslint-disable import/first */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Profile from '../../../../../client/src/components/profile/Profile';

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


import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import RESTcall from '../../../../../client/src/crud';

describe('The profile page', () => {
  const windowSpy = jest.spyOn(global, 'window', 'get');
  const mockedAssign = jest.fn();
  beforeEach(() => {
    windowSpy.mockImplementation(() => ({
      location: {
        assign: mockedAssign,
      },
    }));
  });
  afterEach(() => {
    useSelector.mockClear();
    RESTcall.mockClear();
    mockedAssign.mockClear();
  });
  test('Will render for pins created by the user', async () => {
    const wrapper = shallow(<Profile />);
    await Promise.resolve();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Will render for pins saved by the user', async () => {
    const wrapper = shallow(<Profile />);
    await Promise.resolve();
    const savedButton = wrapper.find({ color: 'primary' });
    savedButton.props().onClick();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Will render signin for non-authenticated users', async () => {
    // Mock redux hooks
    useSelector.mockImplementationOnce(() => ({ authenticated: false }));
    const wrapper = shallow(<Profile />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Will render no image sign if user has not pinned or created any', async () => {
    RESTcall.mockImplementationOnce(() => Promise.resolve({
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

  test('Will change the display setting', async () => {
    const wrapper = shallow(<Profile />);
    await Promise.resolve();
    // owned button is selected by default
    let ownedButton = wrapper.find('ForwardRef(Button)').at(0);
    let savedButton = wrapper.find('ForwardRef(Button)').at(1);
    expect(ownedButton.props().color).toBe('secondary');
    expect(savedButton.props().color).toBe('primary');
    // select savedbutton
    savedButton.props().onClick();
    ownedButton = wrapper.find('ForwardRef(Button)').at(0);
    savedButton = wrapper.find('ForwardRef(Button)').at(1);
    expect(ownedButton.props().color).toBe('primary'); // currently selected
    expect(savedButton.props().color).toBe('secondary');
    // select owned button
    ownedButton.props().onClick();
    ownedButton = wrapper.find('ForwardRef(Button)').at(0);
    savedButton = wrapper.find('ForwardRef(Button)').at(1);
    expect(ownedButton.props().color).toBe('secondary'); // currently selected
    expect(savedButton.props().color).toBe('primary');
  });

  test('Will redirect to logged in user\'s profile page if query matches', async () => {
    RESTcall.mockImplementationOnce(() => Promise.resolve({ redirect: true }));
    shallow(<Profile />);
    await Promise.resolve();
    expect(mockedAssign).toHaveBeenCalledWith('/pins');
  });

  test('Will redirect to root if user chooses not to sign in', async () => {
    // Mock redux hooks
    const push = jest.fn();
    useSelector.mockImplementationOnce(() => ({ authenticated: false }));
    useHistory.mockImplementation(() => ({ push }));
    const wrapper = shallow(<Profile />);
    const signin = wrapper.find('SignIn');
    signin.props().removeSignin();
    expect(push).toHaveBeenCalledWith('/');
  });

  test('Will not render if REST call is rejected', async () => {
    RESTcall.mockImplementationOnce(() => Promise.reject());
    const wrapper = shallow(<Profile />);
    await Promise.resolve();
    expect(wrapper.isEmptyRender()).toBe(true);
  });
});
