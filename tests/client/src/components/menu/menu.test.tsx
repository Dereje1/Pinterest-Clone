/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import {
  Menu, mapStateToProps, Brand, Login,
} from '../../../../../client/src/components/menu/menu';
import { reduxStub } from '../../../stub';

describe('The Menu component', () => {
  let props: React.ComponentProps<typeof Menu>;
  beforeEach(() => {
    props = {
      user: { ...reduxStub.user },
      location: {
        pathname: '/',
      },
      getUser: jest.fn(),
      updateSearch: jest.fn(),
      search: { term: null, tagSearch: false, sort: false },
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('will render for an authenticated user', async () => {
    const wrapper = shallow(<Menu {...props} />);
    await Promise.resolve();
    const cover = wrapper.find('Cover');
    expect(props.getUser).toHaveBeenCalledWith('/auth/profile');
    expect(cover.length).toBe(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will open the search bar on search click of menu bar', async () => {
    const wrapper = shallow<Menu>(<Menu {...props} />);
    await Promise.resolve();
    const cover = wrapper.find('Cover');
    const collapsibleMenu: EnzymePropSelector = wrapper.find('CollapsibleMenu');
    expect(wrapper.state().showSearch).toBe(false);
    expect(props.getUser).toHaveBeenCalledWith('/auth/profile');
    expect(cover.length).toBe(0);
    collapsibleMenu.props().menuClicked({ target: { innerText: 'Search' } });
    expect(wrapper.state().showSearch).toBe(true);
  });

  test('will render for an open search bar', async () => {
    const wrapper = shallow<Menu>(<Menu {...props} />);
    await Promise.resolve();
    expect(wrapper.state().showSearch).toBe(false);
    const search: EnzymePropSelector = wrapper.find('Search');
    search.props().openSearch();
    expect(wrapper.state().showSearch).toBe(true);
    search.props().closeSearch();
    expect(wrapper.state().showSearch).toBe(false);
  });

  test('will render for users authenticated as guest', async () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        authenticated: false,
      },
    };
    const wrapper = shallow(<Menu {...updatedProps} />);
    await Promise.resolve();
    wrapper.setState({ displaySignIn: true });
    const cover = wrapper.find('Cover');
    expect(cover.length).toBe(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  test('will render the cover for non-authenticated users', async () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        authenticated: false,
        username: null,
      },
    };
    const wrapper = shallow(<Menu {...updatedProps} />);
    await Promise.resolve();
    const cover = wrapper.find('Cover');
    expect(cover.length).toBe(1);
  });

  test('will toggle the sign-in modal for guest users', async () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        authenticated: false,
      },
    };
    const wrapper = shallow<Menu>(<Menu {...updatedProps} />);
    await Promise.resolve();
    expect(wrapper.state().displaySignIn).toBe(false);
    const signInButton: EnzymePropSelector = wrapper.find('Login');
    signInButton.props().showSignIn();
    expect(wrapper.state().displaySignIn).toBe(true);
    const signInModal: EnzymePropSelector = wrapper.find('SignIn');
    signInModal.props().removeSignin();
    expect(wrapper.state().displaySignIn).toBe(false);
  });

  test('will map redux state to props', () => {
    const mappedProps = mapStateToProps(reduxStub);
    expect(mappedProps).toEqual({ ...reduxStub });
  });

  test('will render the brand', () => {
    const wrapper = shallow(<Brand />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the Login', () => {
    const wrapper = shallow(<Login showSignIn={jest.fn()} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will toggle the pin sort', async () => {
    const updatedProps = {
      ...props,
      search: { term: null, tagSearch: false, sort: true },
    };
    const wrapper = shallow<Menu>(<Menu {...updatedProps} />);
    await Promise.resolve();
    const sortButton: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    const sortIcon: EnzymePropSelector = sortButton.find('Memo(ForwardRef(SortIcon))');
    const shuffleIcon: EnzymePropSelector = sortButton.find('Memo(ForwardRef(ShuffleIcon))');
    sortButton.props().onClick();
    expect(props.updateSearch).toHaveBeenLastCalledWith('', false, false);
    expect(sortIcon.isEmptyRender()).toBe(true);
    expect(shuffleIcon.isEmptyRender()).toBe(false);
  });
});
