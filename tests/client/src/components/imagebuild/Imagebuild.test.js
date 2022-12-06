/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
// import toJson from 'enzyme-to-json';
import ImageBuild from '../../../../../client/src/components/imagebuild/Imagebuild';
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

  // test('will render....', () => {
  //   const wrapper = shallow(<ImageBuild {...props} />);
  //   expect(toJson(wrapper)).toMatchSnapshot();
  // });

  test('will call layoutComplete when masonry is done loading', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    let Loading = wrapper.find('Loading');
    expect(Loading.props().imagesLoaded).toBe(false);
    let masonry = wrapper.find('MasonryPins');
    masonry.props().layoutComplete();
    Loading = wrapper.find('Loading');
    expect(Loading.props().imagesLoaded).toBe(true);
    // re-fire to make sure that imagesloaded does not change state again
    masonry = wrapper.find('MasonryPins');
    masonry.props().layoutComplete();
    Loading = wrapper.find('Loading');
    expect(Loading.props().imagesLoaded).toBe(true);
  });

  test('will call pinEnlarge for a single pin', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { type: 'any' }, pageY: 20, clientY: 10 }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([pinsStub[1], 10]);
  });

  test('will dismiss pinEnlarge for clicks near submit', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { type: 'submit' }, pageY: 20, clientY: 10 }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
  });

  test('will dismiss pinEnlarge if pin already zoomed', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    let masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { type: 'any' }, pageY: 20, clientY: 10 }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([pinsStub[1], 10]);
    // re-fire again after pin is already zooomed
    masonry = wrapper.find('MasonryPins');
    masonry.props().pinEnlarge({ target: { type: 'any' }, pageY: 20, clientY: 5 }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // If not working second arg should have been 15
    expect(pinZoom.props().zoomInfo).toEqual([pinsStub[1], 10]);
  });

  test('will reset pinEnlarge', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { type: 'any' }, pageY: 20, clientY: 10 }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([pinsStub[1], 10]);
    pinZoom.props().reset();
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
  });

  test('will handle onBrokenImage for an image load error on home page', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    let masonry = wrapper.find('MasonryPins');
    expect(masonry.props().pins).toEqual(pinsStub);
    masonry.props().onBrokenImage(2);
    masonry = wrapper.find('MasonryPins');
    expect(masonry.props().pins).toEqual([pinsStub[0], pinsStub[2]]);
  });

  test('will handle onBrokenImage for an image load error on profile page', () => {
    const updatedProps = {
      ...props,
      displayBrokenImage: true,
    };
    const wrapper = shallow(<ImageBuild {...updatedProps} />);
    let masonry = wrapper.find('MasonryPins');
    expect(masonry.props().pins).toEqual(pinsStub);
    masonry.props().onBrokenImage(2);
    masonry = wrapper.find('MasonryPins');
    expect(masonry.props().pins[1].imgDescription).toBe('Broken Img - imgDescription id-2');
  });

  test('will go to next section on infinite scroll', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryPins');
    masonry.props().layoutComplete();
    let Loading = wrapper.find('Loading');
    expect(Loading.props().imagesLoaded).toBe(true);
    const infiniteScroll = wrapper.find('InfiniteScroll');
    infiniteScroll.props().next();
    Loading = wrapper.find('Loading');
    expect(Loading.props().imagesLoaded).toBe(false);
  });
});
