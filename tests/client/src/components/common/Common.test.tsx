import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Loading, UserPinsSelector, ProfileLink } from '../../../../../client/src/components/common/common';

describe('Loading...', () => {
  test('Will render the loading bubbles', () => {
    const wrapper = shallow(<Loading />);
    const bubbles = wrapper.find({ id: 'loadingcontainer' });
    expect(toJson(bubbles)).toMatchSnapshot();
  });

  test('Will not render the loading bubbles', () => {
    const wrapper = shallow(<Loading ready imagesLoaded />);
    const bubbles = wrapper.find({ id: 'loadingcontainer' });
    expect(toJson(bubbles)).toMatchSnapshot();
  });
});

describe('The user pins selector', () => {
  test('Will highlight the owned button', () => {
    const setDisplaySetting = jest.fn();
    const wrapper = shallow(<UserPinsSelector setDisplaySetting={setDisplaySetting} displaySetting="created" />);
    // for owned button
    const ownedButton: EnzymePropSelector = wrapper.find('ForwardRef(Button)').at(0);
    const savedButton: EnzymePropSelector = wrapper.find('ForwardRef(Button)').at(1);
    expect(ownedButton.props().color).toBe('secondary');
    expect(savedButton.props().color).toBe('primary');
    savedButton.props().onClick();
    expect(setDisplaySetting).toHaveBeenCalledWith('saved');
  });
  test('Will highlight the saved button', () => {
    const setDisplaySetting = jest.fn();
    const wrapper = shallow(<UserPinsSelector setDisplaySetting={setDisplaySetting} displaySetting="saved" />);
    // for owned button
    const ownedButton: EnzymePropSelector = wrapper.find('ForwardRef(Button)').at(0);
    const savedButton: EnzymePropSelector = wrapper.find('ForwardRef(Button)').at(1);
    expect(ownedButton.props().color).toBe('primary');
    expect(savedButton.props().color).toBe('secondary');
    ownedButton.props().onClick();
    expect(setDisplaySetting).toHaveBeenCalledWith('created');
  });
});

describe('The Profile Link', () => {
  test('will render for an authenticated user', () => {
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

  test('will render for a non authenticated user', () => {
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
});
