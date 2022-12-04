/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import MasonryPins from '../../../../../client/src/components/imagebuild/MasonryPins';
import { pinsStub } from '../../../pinsStub';

describe('The MasonryPins component', () => {
  let props;
  beforeEach(() => {
    props = {
      pinImage: jest.fn(),
      deletePin: jest.fn(),
      layoutComplete: jest.fn(),
      pinEnlarge: jest.fn(),
      onBrokenImage: jest.fn(),
      pins: pinsStub,
    };
  });

  afterEach(() => {
    props = null;
  });

  test('will render....', () => {
    const wrapper = shallow(<MasonryPins {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will send parameters to enlarge a pin', () => {
    const wrapper = shallow(<MasonryPins {...props} />);
    const imageBox = wrapper.find({ className: 'image-box' }).at(0);
    imageBox.props().onKeyDown();
    imageBox.props().onClick('event');
    expect(props.pinEnlarge).toHaveBeenCalledWith('event', pinsStub[0]);
  });

  test('will set the visibility of a pin if it is done loading', () => {
    const wrapper = shallow(<MasonryPins {...props} />);
    let imageBox = wrapper.find({ className: 'image-box' }).at(0);
    let img = imageBox.find('img');
    expect(img.props().style.visibility).toBe('hidden');
    img.props().onLoad();
    imageBox = wrapper.find({ className: 'image-box' }).at(0);
    img = imageBox.find('img');
    expect(img.props().style.visibility).toBe('visible');
  });

  test('will send parameters for an error in loading', () => {
    const wrapper = shallow(<MasonryPins {...props} />);
    const imageBox = wrapper.find({ className: 'image-box' }).at(0);
    const img = imageBox.find('img');
    img.props().onError();
    expect(props.onBrokenImage).toHaveBeenCalledWith(1);
  });
});
