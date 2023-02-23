/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ImageBuild from '../../../../../client/src/components/imagebuild/Imagebuild';
import RESTcall from '../../../../../client/src/crud';
import { pinsStub, reduxStub } from '../../../stub';
import { PinType, PinnerType } from '../../../../../client/src/interfaces';

jest.mock('../../../../../client/src/crud');
const mockedRESTcall = jest.mocked(RESTcall);

describe('The ImageBuild component', () => {
  let props: React.ComponentProps<typeof ImageBuild>;
  let parentDivStyleStub: {
    imgWidth: number
    parentWidth: number
    isNoFit: boolean
    top: number
    width: string
  };
  beforeEach(() => {
    props = {
      pinImage: true,
      deletePin: jest.fn(),
      pinList: pinsStub,
      displayBrokenImage: false,
      ready: true,
      user: { ...reduxStub.user },
    };
    parentDivStyleStub = {
      top: 10,
      imgWidth: 598,
      parentWidth: 598,
      width: '90%',
      isNoFit: false,
    };
  });

  afterEach(() => {
    mockedRESTcall.mockClear();
  });

  test('will render....', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will call layoutComplete when masonry is done loading', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    let Loading: EnzymePropSelector = wrapper.find('Loading');
    expect(Loading.props().imagesLoaded).toBe(false);
    let masonry: EnzymePropSelector = wrapper.find('MasonryPins');
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
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
    });
  });

  test('will dismiss pinEnlarge for clicks on the action button', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'actionbutton' } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
  });

  test('will dismiss pinEnlarge if pin already zoomed', () => {
    document.body.scrollTop = 10;
    const wrapper = shallow(<ImageBuild {...props} />);
    let masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
    });
    // re-fire again after pin is already zooomed
    masonry = wrapper.find('MasonryPins');
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // If not working second arg should have been 15
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
    });
  });

  test('will reset pinEnlarge', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
    });
    pinZoom.props().reset();
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
  });

  test('will handle onBrokenImage for an image load error on home page', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    let masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    expect(masonry.props().pins).toEqual(pinsStub);
    masonry.props().onBrokenImage('2');
    masonry = wrapper.find('MasonryPins');
    expect(masonry.props().pins).toEqual([pinsStub[0], pinsStub[2]]);
  });

  test('will handle onBrokenImage for an image load error on profile page', () => {
    const updatedProps = {
      ...props,
      displayBrokenImage: true,
    };
    const wrapper = shallow(<ImageBuild {...updatedProps} />);
    let masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    expect(masonry.props().pins).toEqual(pinsStub);
    masonry.props().onBrokenImage('2');
    masonry = wrapper.find('MasonryPins');
    expect(masonry.props().pins[1].imgDescription).toBe('Broken Img - imgDescription id-2');
  });

  test('will go to next section on infinite scroll', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    masonry.props().layoutComplete();
    let Loading: EnzymePropSelector = wrapper.find('Loading');
    expect(Loading.props().imagesLoaded).toBe(true);
    const infiniteScroll: EnzymePropSelector = wrapper.find('InfiniteScroll');
    infiniteScroll.props().next();
    Loading = wrapper.find('Loading');
    expect(Loading.props().imagesLoaded).toBe(false);
  });

  test('will update comments while pin is zoomed', async () => {
    document.body.scrollTop = 10;
    const wrapper: EnzymePropSelector = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin and assert pin has correct info
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
    });
    // trigger a new comment
    await pinZoom.props().handleNewComment('tester comment');
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall).toHaveBeenCalledWith({
      address: '/api/comment/2',
      method: 'put',
      payload: {
        comment: 'tester comment',
      },
    });
    // assert that new comment is reflected in zoomed pin
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.props().zoomInfo.pin).toEqual({ _id: '2', comments: ['tester comment'] });
  });

  test('will close pinzoom if zoomed pin disapears (ex. deleted from profile)', () => {
    document.body.scrollTop = 10;
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin and assert pin has correct info
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
    });
    // update pins list and assert that zoomed pin is gone
    wrapper.setProps({
      ...props,
      pinList: [pinsStub[0], pinsStub[2]],
      displayBrokenImage: true,
    });
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
  });

  test('ImageBuild sub-component will signal to pin/save an image', async () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    // await Promise.resolve();
    let masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let imageToPin = masonry.props().pins.filter((p: PinType) => p._id === pinsStub[0]._id)[0];
    let savedByNames = imageToPin.savedBy.map((s: PinnerType) => s.name);
    expect(savedByNames.includes('tester displayName')).toBe(false);
    await masonry.props().pinImage(pinsStub[0]);
    masonry = wrapper.find('MasonryPins');
    [imageToPin] = masonry.props().pins.filter((p: PinType) => p._id === pinsStub[0]._id);
    savedByNames = imageToPin.savedBy.map((s: PinnerType) => s.name);
    expect(savedByNames.includes('tester displayName')).toBe(true);
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall.mock.calls).toEqual([
      [
        {
          address: '/api/pin/1',
          method: 'put',
          payload: undefined,
        },
      ],
    ]);
  });

  test('ImageBuild sub-component will signal to unpin an image', async () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    // await Promise.resolve();
    let masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let imageToUnPin = masonry.props().pins.filter((p: PinType) => p._id === pinsStub[1]._id)[0];
    let savedByNames = imageToUnPin.savedBy.map((s: PinnerType) => s.name);
    expect(savedByNames.includes('savedBy - id-2git')).toBe(true);
    await masonry.props().pinImage(pinsStub[1]);
    masonry = wrapper.find('MasonryPins');
    [imageToUnPin] = masonry.props().pins.filter((p: PinType) => p._id === pinsStub[1]._id);
    savedByNames = imageToUnPin.savedBy.map((s: PinnerType) => s.name);
    expect(savedByNames.includes('savedBy - id-2git')).toBe(false);
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall.mock.calls).toEqual([
      [
        {
          address: '/api/unpin/2',
          method: 'put',
          payload: undefined,
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
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    await masonry.props().pinImage(pinsStub[0]);
    let signIn: EnzymePropSelector = wrapper.find('SignIn');
    expect(signIn.length).toBe(1);
    signIn.props().removeSignin();
    signIn = wrapper.find('SignIn');
    expect(signIn.length).toBe(0);
  });

  test('Can display the sign in component for non-authenticated (guest) users from a zoomed pin', async () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        authenticated: false,
        username: 'Guest',
      },
    };
    const wrapper = shallow(<ImageBuild {...updatedProps} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    let signIn: EnzymePropSelector = wrapper.find('SignIn');
    expect(signIn.length).toBe(0);
    pinZoom.props().displayLogin();
    signIn = wrapper.find('SignIn');
    expect(signIn.length).toBe(1);
  });

  test('will send query to update tags while pin is zoomed', async () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin
    masonry.props().pinEnlarge({ target: { className: 'any', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // trigger a tag update
    await pinZoom.props().updateTags('tag_query');
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall).toHaveBeenCalledWith({
      address: '/api/updateTags/tag_query',
      method: 'put',
      payload: undefined,
    });
    // assert that new comment is reflected in zoomed pin
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.props().zoomInfo.pin).toEqual({ _id: '2', tags: [{ _id: 6, tag: 'tester tag' }] });
  });
});
