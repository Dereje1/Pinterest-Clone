import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ImageBuild from '../../../../../client/src/components/imagebuild/imagebuild';
import { pinsStub } from '../../../pinsStub';

describe('The ImageBuild component', () => {
  let props;
  beforeEach(() => {
    props = {
      pinImage: jest.fn(),
      deletePin: jest.fn(),
      pinList: pinsStub,
      displayBrokenImage: false,
    };
  });

  test('will render....', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will call layoutComplete when masonry is done loading', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    let bubblecontainer = wrapper.find({ id: 'bubblecontainer' });
    expect(bubblecontainer.props().style).toEqual({ display: 'flex' });
    const masonry = wrapper.find('MasonryComponent');
    masonry.props().onImagesLoaded();
    bubblecontainer = wrapper.find({ id: 'bubblecontainer' });
    expect(bubblecontainer.props().style).toEqual({ display: 'none' });
  });

  test('will call pinEnlarge for a single pin', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const pin = wrapper.find({ className: 'image-box' }).at(1);
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    pin.props().onClick({ target: { type: 'any' }, pageY: 20, clientY: 10 });
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([pinsStub[1], 10]);
  });

  test('will handle onBrokenImage for an image load error', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    let pin = wrapper.find({ className: 'image-box' }).at(1);
    let img = pin.find({ alt: 'imgDescription id-2' });
    img.props().onError();
    pin = wrapper.find({ className: 'image-box' }).at(1);
    img = pin.find({ alt: 'imgDescription id-2' });
    expect(img.isEmptyRender()).toBe(true);
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
