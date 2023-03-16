/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import CollapsibleMenu from '../../../../../client/src/components/menu/CollapsibleMenu';

describe('The collapsible menu component', () => {
  test('will render for home', () => {
    const wrapper = shallow(<CollapsibleMenu pathname="/" menuClicked={jest.fn()} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  test('will render for my pins', () => {
    const wrapper = shallow(<CollapsibleMenu pathname="/pins" menuClicked={jest.fn()} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with anchor as "top"', () => {
    global.innerWidth = 749;
    const wrapper = shallow(<CollapsibleMenu pathname="/" menuClicked={jest.fn()} />);
    const drawer: EnzymePropSelector = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().anchor).toBe('top');
  });

  test('will go to the Admin user page if users is selected', () => {
    const wrapper = shallow(<CollapsibleMenu pathname="/" menuClicked={jest.fn()} />);
    const usersLink: EnzymePropSelector = wrapper.find('ForwardRef(MenuItem)').at(2);
    expect(usersLink.props().to).toBe('/profile/63acc05f21481fa569a03b0b');
  });

  test('will stay on the same page if users is selected again while on a profile page', () => {
    const wrapper = shallow(<CollapsibleMenu pathname="/some_profile" menuClicked={jest.fn()} />);
    const usersLink: EnzymePropSelector = wrapper.find('ForwardRef(MenuItem)').at(2);
    expect(usersLink.props().to).toBe('/some_profile');
  });

  test('will toggle the drawer', () => {
    const wrapper = shallow(<CollapsibleMenu pathname="/" menuClicked={jest.fn()} />);
    const menuIcon: EnzymePropSelector = wrapper.find('Memo(ForwardRef(MenuIcon))');
    let drawer: EnzymePropSelector = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().open).toBe(false);
    menuIcon.props().onClick({ type: '' });
    drawer = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().open).toBe(true);
  });

  test('will not toggle the drawer on certain events', () => {
    const wrapper = shallow(<CollapsibleMenu pathname="/" menuClicked={jest.fn()} />);
    const menuIcon: EnzymePropSelector = wrapper.find('Memo(ForwardRef(MenuIcon))');
    let drawer: EnzymePropSelector = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().open).toBe(false);
    menuIcon.props().onClick({ type: 'keydown', key: 'Tab' });
    drawer = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().open).toBe(false);
    menuIcon.props().onClick({ type: 'keydown', key: 'Shift' });
    drawer = wrapper.find('ForwardRef(Drawer)');
    expect(drawer.props().open).toBe(false);
  });
});
