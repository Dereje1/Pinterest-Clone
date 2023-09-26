/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ImageBuild from '../../../../../../client/src/components/common/imagebuild/Imagebuild';
import RESTcall from '../../../../../../client/src/crud';
import { pinsStub, reduxStub } from '../../../../stub';
import { PinType, PinnerType, zoomedImageInfoType } from '../../../../../../client/src/interfaces';

jest.mock('../../../../../../client/src/crud');
const mockedRESTcall = jest.mocked(RESTcall);

describe('The ImageBuild component', () => {
  let props: React.ComponentProps<typeof ImageBuild>;
  let parentDivStyleStub: zoomedImageInfoType['parentDivStyle'];
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
      imgHeight: 598,
      parentWidth: 598,
      width: '90%',
      isNoFit: false,
      border: 0,
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
    global.pageYOffset = 10;
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
      loadedIndex: 1,
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
    global.pageYOffset = 10;
    const wrapper = shallow(<ImageBuild {...props} />);
    let masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
      loadedIndex: 1,
    });
    // re-fire again after pin is already zooomed
    masonry = wrapper.find('MasonryPins');
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // If not working second arg should have been 15
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
      loadedIndex: 1,
    });
  });

  test('will reset pinEnlarge', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
      loadedIndex: 1,
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
    global.pageYOffset = 10;
    const wrapper: EnzymePropSelector = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin and assert pin has correct info
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
      loadedIndex: 1,
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
    global.pageYOffset = 10;
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin and assert pin has correct info
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(false);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
      loadedIndex: 1,
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
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
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
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // trigger a tag update
    await pinZoom.props().updateTags('tag_query');
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall).toHaveBeenCalledWith({
      address: '/api/updateTags/tag_query',
      method: 'put',
    });
    // assert that new comment is reflected in zoomed pin
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.props().zoomInfo.pin).toEqual({ _id: '2', tags: [{ _id: 6, tag: 'tester tag' }] });
  });

  test('will handle swipes on zoomed image', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // trigger a tag update
    pinZoom.props().onSlidePin(2);
    // assert that zoomed pin has new info refelected
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[2],
      parentDivStyle: {
        ...parentDivStyleStub, imgWidth: 1003.52, parentWidth: 1003.52, border: 2,
      },
      loadedIndex: 2,
    });
  });

  test('will handle positive boundry conditions on swipe if index is out of bounds', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // trigger a tag update
    pinZoom.props().onSlidePin(3);
    // assert that zoomed pin has new info refelected
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[0],
      parentDivStyle: {
        ...parentDivStyleStub, imgWidth: 1003.52, parentWidth: 1003.52, border: 2,
      },
      loadedIndex: 0,
    });
  });

  test('will handle negative boundry conditions on swipe if index is out of bounds', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[0]);
    pinZoom = wrapper.find('PinZoom');
    // trigger a tag update
    pinZoom.props().onSlidePin(-1);
    // assert that zoomed pin has new info refelected
    pinZoom = wrapper.find('PinZoom');
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[2],
      parentDivStyle: {
        ...parentDivStyleStub, imgWidth: 1003.52, parentWidth: 1003.52, border: 2,
      },
      loadedIndex: 2,
    });
  });

  test('will reset the parentdiv style for a given image', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // trigger a tag update
    const ans = pinZoom.props().resetParentDivStyle({ naturalWidth: 200, naturalHeight: 400 });
    // assert that zoomed pin has new info refelected
    pinZoom = wrapper.find('PinZoom');
    expect(ans).toEqual({
      ...parentDivStyleStub, imgWidth: 299, parentWidth: 500, top: 10, isNoFit: true,
    });
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: ans,
      loadedIndex: 1,
    });
  });

  test('will not reset the parentdiv style if no metadata given', () => {
    const wrapper = shallow(<ImageBuild {...props} />);
    const masonry: EnzymePropSelector = wrapper.find('MasonryPins');
    let pinZoom: EnzymePropSelector = wrapper.find('PinZoom');
    expect(pinZoom.isEmptyRender()).toBe(true);
    // zoom into pin
    masonry.props().pinEnlarge({ target: { className: 'image-format', naturalWidth: 600, naturalHeight: 600 } }, pinsStub[1]);
    pinZoom = wrapper.find('PinZoom');
    // trigger a tag update
    const ans = pinZoom.props().resetParentDivStyle();
    // assert that zoomed pin has new info refelected
    pinZoom = wrapper.find('PinZoom');
    expect(ans).toEqual(null);
    expect(pinZoom.props().zoomInfo).toEqual({
      pin: pinsStub[1],
      parentDivStyle: { ...parentDivStyleStub },
      loadedIndex: 1,
    });
  });
});
