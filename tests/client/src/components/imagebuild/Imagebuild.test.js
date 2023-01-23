/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ImageBuild from '../../../../../client/src/components/imagebuild/Imagebuild';
import RESTcall from '../../../../../client/src/crud';
import { pinsStub } from '../../../pinsStub';

jest.mock('../../../../../client/src/crud');

describe('The ImageBuild component', () => {
  let props; let
    parentDivStyleStub;
  beforeEach(() => {
    props = {
      pinImage: true,
      deletePin: jest.fn(),
      pinList: pinsStub,
      displayBrokenImage: false,
      ready: true,
      user: {},
    };
    parentDivStyleStub = {
      top: 10,
      imgWidth: '598px',
      parentWidth: 598,
      width: '90%',
      isNoFit: false,
    };
    global.scrollTo = jest.fn();
  });

  afterEach(() => {
    RESTcall.mockClear();
    global.scrollTo = null;
    parentDivStyleStub = null;
    props = null;
  });

  test('will render....', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

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
    document.body.scrollTop = 10;
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([
      pinsStub[1],
      { ...parentDivStyleStub },
    ]);
  });

  test('will dismiss pinEnlarge for clicks on the action button', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'actionbutton' } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
  });

  test('will dismiss pinEnlarge if pin already zoomed', () => {
    document.body.scrollTop = 10;
    const wrapper = shallow(<ImageBuild {...props} />);
    let masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([
      pinsStub[1],
      { ...parentDivStyleStub },
    ]);
    // re-fire again after pin is already zooomed
    masonry = wrapper.find('MasonryPins');
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // If not working second arg should have been 15
    expect(pinZoom.props().zoomInfo).toEqual([
      pinsStub[1],
      { ...parentDivStyleStub },
    ]);
  });

  test('will reset pinEnlarge', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([
      pinsStub[1],
      { ...parentDivStyleStub },
    ]);
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

  test('will update comments while pin is zoomed', async () => {
    document.body.scrollTop = 10;
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin and assert pin has correct info
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([
      pinsStub[1],
      { ...parentDivStyleStub },
    ]);
    // trigger a new comment
    await pinZoom.props().handleNewComment('tester comment');
    expect(RESTcall).toHaveBeenCalledTimes(1);
    expect(RESTcall).toHaveBeenCalledWith({
      address: '/api/comment/2',
      method: 'put',
      payload: {
        comment: 'tester comment',
      },
    });
    // assert that new comment is reflected in zoomed pin
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.props().zoomInfo[0]).toEqual({ _id: 2, comments: ['tester comment'] });
  });

  test('will close pinzoom if zoomed pin disapears (ex. deleted from profile)', () => {
    document.body.scrollTop = 10;
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin and assert pin has correct info
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual([
      pinsStub[1],
      { ...parentDivStyleStub },
    ]);
    // update pins list and assert that zoomed pin is gone
    wrapper.setProps({ ...props, pinList: [pinsStub[0], pinsStub[2]] });
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
  });

  test('ImageBuild sub-component will signal to pin/save an image', async () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    // await Promise.resolve();
    let masonry = wrapper.find('MasonryPins');
    let imageToPin = masonry.props().pins.filter((p) => p._id === pinsStub[0]._id)[0];
    let savedByNames = imageToPin.savedBy.map((s) => s.name);
    expect(savedByNames.includes('tester displayName')).toBe(false);
    await masonry.props().pinImage(pinsStub[0]);
    masonry = wrapper.find('MasonryPins');
    [imageToPin] = masonry.props().pins.filter((p) => p._id === pinsStub[0]._id);
    savedByNames = imageToPin.savedBy.map((s) => s.name);
    expect(savedByNames.includes('tester displayName')).toBe(true);
    expect(RESTcall).toHaveBeenCalledTimes(1);
    expect(RESTcall.mock.calls).toEqual([
      [
        {
          address: '/api/pin/1',
          method: 'put',
        },
      ],
    ]);
  });

  test('ImageBuild sub-component will signal to unpin an image', async () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    // await Promise.resolve();
    let masonry = wrapper.find('MasonryPins');
    let imageToUnPin = masonry.props().pins.filter((p) => p._id === pinsStub[1]._id)[0];
    let savedByNames = imageToUnPin.savedBy.map((s) => s.name);
    expect(savedByNames.includes('savedBy - id-2git')).toBe(true);
    await masonry.props().pinImage(pinsStub[1]);
    masonry = wrapper.find('MasonryPins');
    [imageToUnPin] = masonry.props().pins.filter((p) => p._id === pinsStub[1]._id);
    savedByNames = imageToUnPin.savedBy.map((s) => s.name);
    expect(savedByNames.includes('savedBy - id-2git')).toBe(false);
    expect(RESTcall).toHaveBeenCalledTimes(1);
    expect(RESTcall.mock.calls).toEqual([
      [
        {
          address: '/api/unpin/2',
          method: 'put',
        },
      ],
    ]);
  });

  test('Shall display the sign in component for non-authenticated (guest) users on save', async () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        authenticated: false,
        username: 'Guest',
      },
    };
    const wrapper = shallow(<ImageBuild {...updatedProps} />);
    const masonry = wrapper.find('MasonryPins');
    await masonry.props().pinImage(pinsStub[0]);
    let signIn = wrapper.find('SignIn');
    expect(signIn.length).toBe(1);
    signIn.props().removeSignin();
    signIn = wrapper.find('SignIn');
    expect(signIn.length).toBe(0);
  });

  test('will send query to update tags while pin is zoomed', async () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // trigger a tag update
    await pinZoom.props().updateTags('tag_query');
    expect(RESTcall).toHaveBeenCalledTimes(1);
    expect(RESTcall).toHaveBeenCalledWith({
      address: '/api/updateTags/tag_query',
      method: 'put',
    });
    // assert that new comment is reflected in zoomed pin
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.props().zoomInfo[0]).toEqual({ _id: 2, tags: [{ _id: 6, tag: 'tester tag' }] });
  });
});
