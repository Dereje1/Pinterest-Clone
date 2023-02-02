/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import {
  Menu, mapStateToProps, ExpandedMenu, Brand, Login,
} from '../../../../../client/src/components/menu/menu';
import { reduxStub } from '../../../stub';

describe('The Menu component', () => {
  let props;
  beforeEach(() => {
    props = {
      user: {
        authenticated: true,
        displayName: 'tester displayName',
        username: 'tester username',
        service: 'tester service',
        userId: 'tester user Id',
      },
      location: {
        pathname: '/',
      },
      getUser: jest.fn(),
      updateSearch: jest.fn(),
    };
  });
  afterEach(() => {
    props = null;
    jest.clearAllMocks();
  });
  test('will render for an authenticated user', () => {
    const wrapper = shallow(<Menu {...props} />);
    const cover = wrapper.find('Cover');
    expect(cover.length).toBe(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for an open search bar', () => {
    const wrapper = shallow<Menu>(<Menu {...props} />);
    expect(wrapper.state().showSearch).toBe(false);
    const search: EnzymePropSelector = wrapper.find('Search');
    search.props().openSearch();
    expect(wrapper.state().showSearch).toBe(true);
    search.props().closeSearch();
    expect(wrapper.state().showSearch).toBe(false);
  });

  test('will render for users authenticated as guest', () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        authenticated: false,
      },
    };
    const wrapper = shallow(<Menu {...updatedProps} />);
    wrapper.setState({ displaySignIn: true });
    const cover = wrapper.find('Cover');
    expect(cover.length).toBe(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  test('will render the cover for non-authenticated users', () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        authenticated: false,
        username: undefined,
      },
    };
    const wrapper = shallow(<Menu {...updatedProps} />);
    const cover = wrapper.find('Cover');
    expect(cover.length).toBe(1);
  });

  test('will render the collapsed menu', () => {
    const wrapper = shallow(<Menu {...props} />);
    wrapper.setState({ menuIsCollapsed: true });
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will toggle the sign-in modal for guest users', () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        authenticated: false,
      },
    };
    const wrapper = shallow<Menu>(<Menu {...updatedProps} />);
    expect(wrapper.state().displaySignIn).toBe(false);
    const signInButton: EnzymePropSelector = wrapper.find('Login');
    signInButton.props().showSignIn();
    expect(wrapper.state().displaySignIn).toBe(true);
    const signInModal: EnzymePropSelector = wrapper.find('SignIn');
    signInModal.props().removeSignin();
    expect(wrapper.state().displaySignIn).toBe(false);
  });

  test('will logout the user from the extended menu', () => {
    const windowSpy = jest.spyOn(window, 'location', 'get');
    const mockedAssign = jest.fn();
    windowSpy.mockReturnValue({
      ...window.location,
      assign: mockedAssign,
    });
    const wrapper = shallow(<ExpandedMenu />);
    const logoutLink: EnzymePropSelector = wrapper.find('NavLink').at(2);
    logoutLink.props().onClick();
    expect(mockedAssign).toHaveBeenCalledWith('/auth/logout');
  });

  test('will map redux state to props', () => {
    const mappedProps = mapStateToProps(reduxStub);
    expect(mappedProps).toEqual({ user: reduxStub.user });
  });

  test('will render the brand', () => {
    const wrapper = shallow(<Brand />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the Login', () => {
    const wrapper = shallow(<Login showSignIn={jest.fn()} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the auth menu', () => {
    const wrapper = shallow(<ExpandedMenu />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
