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
      ready: true,
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
    let masonry = wrapper.find('MasonryComponent');
    masonry.props().onImagesLoaded();
    bubblecontainer = wrapper.find({ id: 'bubblecontainer' });
    expect(bubblecontainer.props().style).toEqual({ display: 'none' });
    // re-fire to make sure that imagesloaded does not change state again
    masonry = wrapper.find('MasonryComponent');
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

  test('will dismiss pinEnlarge for clicks near submit', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const pin = wrapper.find({ className: 'image-box' }).at(1);
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    pin.props().onClick({ target: { type: 'submit' }, pageY: 20, clientY: 10 });
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
  });

  test('will dismiss pinEnlarge if pin already zoomed', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    let pin = wrapper.find({ className: 'image-box' }).at(1);
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    pin.props().onClick({ target: { type: 'any' }, pageY: 20, clientY: 10 });
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([pinsStub[1], 10]);
    // re-fire again after pin is already zooomed
    pin = wrapper.find({ className: 'image-box' }).at(1);
    pin.props().onClick({ target: { type: 'any' }, pageY: 20, clientY: 5 });
    pinZoom = wrapper.find('PinZoom');
    // If not working second arg should have been 15
    expect(pinZoom.props().zoomInfo).toEqual([pinsStub[1], 10]);
  });

  test('will reset pinEnlarge', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const pin = wrapper.find({ className: 'image-box' }).at(1);
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    pin.props().onClick({ target: { type: 'any' }, pageY: 20, clientY: 10 });
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([pinsStub[1], 10]);
    pinZoom.props().reset();
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
  });

  test('will handle onBrokenImage for an image load error on home page', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    let pin = wrapper.find({ className: 'image-box' }).at(1);
    let img = pin.find({ alt: 'imgDescription id-2' });
    img.props().onError();
    pin = wrapper.find({ className: 'image-box' }).at(1);
    img = pin.find({ alt: 'imgDescription id-2' });
    expect(img.isEmptyRender()).toBe(true);
  });

  test('will handle onBrokenImage for an image load error on profile page', () => {
    const updatedProps = {
      ...props,
      displayBrokenImage: true,
    };
    const wrapper = shallow(<ImageBuild {...updatedProps} />);
    let pin = wrapper.find({ className: 'image-box' }).at(1);
    let img = pin.find({ alt: 'imgDescription id-2' });
    img.props().onError();
    pin = wrapper.find({ className: 'image-box' }).at(1);
    img = pin.find({ alt: 'Broken Img - imgDescription id-2' });
    expect(img.isEmptyRender()).toBe(false);
  });

  test('will display the bubbles and hide images if not done loading', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const bubbles = wrapper.find({ id: 'bubblecontainer' });
    const pin = wrapper.find({ className: 'image-box' }).at(1);
    const img = pin.find({ alt: 'imgDescription id-2' });
    expect(bubbles.props().style.display).toBe('flex');
    expect(img.props().style.visibility).toBe('hidden');
  });
});
