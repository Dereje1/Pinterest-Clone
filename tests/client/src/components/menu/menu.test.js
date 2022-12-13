/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import {
  Menu, mapStateToProps, AuthMenu, Brand, Login,
} from '../../../../../client/src/components/menu/menu';


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
    const wrapper = shallow(<Menu {...props} />);
    expect(wrapper.state().showSearch).toBe(false);
    const search = wrapper.find('Search');
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
  test('will update the ready state and others on CDU', () => {
    const wrapper = shallow(<Menu {...props} />);
    expect(wrapper.state().initialLoad).toBe(true);
    jest.spyOn(window, 'addEventListener').mockImplementationOnce(() => { });
    wrapper.setState({ collapseToggle: true });
    const prevProps = {
      user: undefined,
    };
    const prevState = {
      collapseToggle: false,
    };
    wrapper.instance().componentDidUpdate(prevProps, prevState);
    expect(wrapper.state().initialLoad).toBe(false);
    expect(window.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });
  test('will togggle the menu collapse', () => {
    const wrapper = shallow(<Menu {...props} />);
    expect(wrapper.state().collapseToggle).toBe(false);
    const e = { target: { closest: jest.fn() } };
    wrapper.instance().listenForOutClicks(e);
    expect(wrapper.state().collapseToggle).toBe(true);
    expect(e.target.closest).toHaveBeenCalledWith('.menu');
  });

  test('will render the collapsed menu', () => {
    const wrapper = shallow(<Menu {...props} />);
    wrapper.setState({ menuIsCollapsed: true, collapseToggle: true });
    const collapsedBurger = wrapper.find({ className: 'items collapsed burger' });
    let responsiveMenuDrop = wrapper.find({ className: 'responsivemenu drop' });
    let responsiveMenuLift = wrapper.find({ className: 'responsivemenu lift' });
    const authMenu = wrapper.find('AuthMenu');
    expect(collapsedBurger.length).toBe(1);
    expect(responsiveMenuDrop.length).toBe(1);
    expect(responsiveMenuLift.length).toBe(0);
    // toggle collapse
    authMenu.props().toggleCollapse();
    responsiveMenuDrop = wrapper.find({ className: 'responsivemenu drop' });
    responsiveMenuLift = wrapper.find({ className: 'responsivemenu lift' });
    expect(responsiveMenuDrop.length).toBe(0);
    expect(responsiveMenuLift.length).toBe(1);
  });

  test('will toggle the sign-in modal for guest users', () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        authenticated: false,
      },
    };
    const wrapper = shallow(<Menu {...updatedProps} />);
    expect(wrapper.state().displaySignIn).toBe(false);
    const signInButton = wrapper.find('Login');
    signInButton.props().showSignIn();
    expect(wrapper.state().displaySignIn).toBe(true);
    const signInModal = wrapper.find('SignIn');
    signInModal.props().removeSignin();
    expect(wrapper.state().displaySignIn).toBe(false);
  });

  test('will logout the user from the extended menu', () => {
    const windowSpy = jest.spyOn(global, 'window', 'get');
    const mockedAssign = jest.fn();
    windowSpy.mockImplementation(() => ({
      location: {
        assign: mockedAssign,
      },
    }));
    const wrapper = shallow(<AuthMenu />);
    const logoutLink = wrapper.find('NavLink').at(2);
    logoutLink.props().onClick();
    expect(mockedAssign).toHaveBeenCalledWith('auth/logout');
  });

  test('will map redux state to props', () => {
    const stateToMap = { user: 'a user', other: 'any other' };
    const mappedProps = mapStateToProps(stateToMap);
    expect(mappedProps).toEqual({ user: 'a user' });
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
    const wrapper = shallow(<AuthMenu toggleCollapse={jest.fn()} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
