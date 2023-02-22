import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ProfileLink from '../../../../../client/src/components/modal/ProfileLink';

test('The profile link component will render for an authenticated user', () => {
  const closePin = jest.fn();
  const displayLogin = jest.fn();
  const wrapper = shallow(<ProfileLink
    title="Link title"
    userId="2"
    closePin={closePin}
    displayLogin={displayLogin}
    authenticated
  />);
  expect(toJson(wrapper)).toMatchSnapshot();
  const link: EnzymePropSelector = wrapper.find('ForwardRef(Link)');
  link.props().onMouseDown({ preventDefault: jest.fn() });
  link.props().onClick({});
  expect(link.props().to).toBe('/profile/2');
  expect(closePin).toHaveBeenCalledWith({}, true);
  expect(displayLogin).not.toHaveBeenCalled();
});

test('The profile link component will render for a non authenticated user', () => {
  const closePin = jest.fn();
  const displayLogin = jest.fn();
  const wrapper = shallow(<ProfileLink
    title="Link title"
    userId="2"
    closePin={closePin}
    displayLogin={displayLogin}
    authenticated={false}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();
  const link: EnzymePropSelector = wrapper.find('ForwardRef(Link)');
  link.props().onMouseDown({ preventDefault: jest.fn() });
  link.props().onClick({});
  expect(link.props().to).toBe('');
  expect(closePin).not.toHaveBeenCalled();
  expect(displayLogin).toHaveBeenCalledWith();
});
