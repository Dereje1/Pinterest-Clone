import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ImageBuild from '../../../../../client/src/components/imagebuild/imagebuild';
import { pinsStub } from '../../../pinsStub';

describe('The ImageBuild component', () => {
  let props;
  beforeEach(() => {
    props = {
      layoutComplete: jest.fn(),
      pinEnlarge: jest.fn(),
      onBrokenImage: jest.fn(),
      pinImage: jest.fn(),
      deletePin: jest.fn(),
      resetModal: jest.fn(),
      pinList: pinsStub,
      imagesLoaded: true,
      displayPinZoom: false,
      zoomInfo: [],
    };
  });

  test('will render....', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will call layoutComplete when masonry is done loading', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryComponent');
    masonry.props().onImagesLoaded();
    expect(props.layoutComplete).toHaveBeenCalled();
  });

  test('will call pinEnlarge for a single pin', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const pin = wrapper.find({ className: 'image-box' }).at(1);
    pin.props().onClick({});
    expect(props.pinEnlarge).toHaveBeenCalledWith({}, pinsStub[1]);
  });

  test('will call onBrokenImage for an image load error', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const pin = wrapper.find({ className: 'image-box' }).at(1);
    const img = pin.find({ alt: 'imgDescription id-2' });
    img.props().onError();
    expect(props.onBrokenImage).toHaveBeenCalledWith(2);
  });

  test('will display the bubbles and hide images if not done loading', () => {
    const updatedProps = {
      ...props,
      imagesLoaded: false,
    };
    const wrapper = shallow(<ImageBuild {...updatedProps} />);
    const bubbles = wrapper.find({ id: 'bubblecontainer' });
    const pin = wrapper.find({ className: 'image-box' }).at(1);
    const img = pin.find({ alt: 'imgDescription id-2' });
    expect(bubbles.props().style.display).toBe('flex');
    expect(img.props().style.visibility).toBe('hidden');
  });
});
