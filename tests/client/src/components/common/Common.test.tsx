import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Loading, UserPinsSelector } from '../../../../../client/src/components/common/common';

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
