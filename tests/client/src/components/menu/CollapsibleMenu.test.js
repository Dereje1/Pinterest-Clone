/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import CollapsibleMenu from '../../../../../client/src/components/menu/CollapsibleMenu';

describe('The collapsible menu component', () => {
  test('will render for home', () => {
    const wrapper = shallow(<CollapsibleMenu pathname="/" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  test('will render for my pins', () => {
    const wrapper = shallow(<CollapsibleMenu pathname="/pins" />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will logout the user from the extended menu', () => {
    const windowSpy = jest.spyOn(global, 'window', 'get');
    const mockedAssign = jest.fn();
    windowSpy.mockImplementation(() => ({
      location: {
        assign: mockedAssign,
      },
    }));
    const wrapper = shallow(<CollapsibleMenu pathname="/" />);
    const logoutLink = wrapper.find('ForwardRef(MenuItem)').at(2);
    logoutLink.props().onClick();
    expect(mockedAssign).toHaveBeenCalledWith('auth/logout');
  });

  test('will toggle the drawer', () => {
    const wrapper = shallow(<CollapsibleMenu pathname="/" />);
    const menuIcon = wrapper.find('Memo(ForwardRef(MenuIcon))');
    let drawer = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().open).toBe(false);
    menuIcon.props().onClick({ type: '' });
    drawer = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().open).toBe(true);
  });

  test('will not toggle the drawer on certain events', () => {
    const wrapper = shallow(<CollapsibleMenu pathname="/" />);
    const menuIcon = wrapper.find('Memo(ForwardRef(MenuIcon))');
    let drawer = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().open).toBe(false);
    menuIcon.props().onClick({ type: 'keydown', key: 'Tab' });
    drawer = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().open).toBe(false);
    menuIcon.props().onClick({ type: 'keydown', key: 'Shift' });
    drawer = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().open).toBe(false);
  });
});
