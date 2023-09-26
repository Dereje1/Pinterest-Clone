/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { PinZoom } from '../../../../../../client/src/components/common/modal/modalzoom';
import { pinsStub, reduxStub } from '../../../../stub';

jest.useFakeTimers();

describe('The pin zoom modal', () => {
  let props: PinZoom['props'];
  const focus = jest.fn();
  beforeEach(() => {
    jest.spyOn(React, 'createRef').mockImplementation(() => ({
      current: {
        focus,
        children: [{ clientHeight: 50 }],
      },
    }));
    props = {
      zoomInfo: {
        pin: pinsStub[0],
        parentDivStyle: {
          top: 10,
          imgWidth: 622.5,
          imgHeight: 500,
          parentWidth: 622.5,
          width: '90%',
          isNoFit: false,
          border: 0,
        },
        loadedIndex: 0,
      },
      reset: jest.fn(),
      pinImage: jest.fn(),
      deletePin: null,
      handleNewComment: jest.fn(),
      user: { ...reduxStub.user },
      updateTags: jest.fn(),
      displayLogin: jest.fn(),
      onSlidePin: jest.fn(),
      resetParentDivStyle: jest.fn(() => ({
        top: 10,
        imgWidth: 622.5,
        imgHeight: 500,
        parentWidth: 830,
        width: '90%',
        isNoFit: false,
        border: 0,
      })),
    };
  });

  afterEach(() => {
    focus.mockClear();
  });

  test('will render', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    expect(focus).toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will close the zoom window on blur', async () => {
    const wrapper = shallow(<PinZoom {...props} />);
    const zoomCard = wrapper.find({ className: 'zoom cshow' });
    wrapper.setState({ firstShow: false });
    zoomCard.props().onBlur();
    jest.advanceTimersByTime(500);
    await Promise.resolve();
    expect(props.reset).toHaveBeenCalledTimes(1);
  });

  test('will disable the scroll on mount and when user tries to scroll', () => {
    global.scrollTo = jest.fn();
    const mockedScroll = jest.mocked(global.scrollTo);
    const wrapper = shallow(<PinZoom {...props} />);
    mockedScroll.mockClear();
    const instance = wrapper.instance() as PinZoom;
    instance.disableScroll();
    expect(mockedScroll).toHaveBeenCalledWith(0, 10);
  });

  test('will toggle the comments window', () => {
    global.innerHeight = 1000;
    const updatedProps = {
      ...props,
      zoomInfo: {
        pin: pinsStub[0],
        parentDivStyle: {
          top: 10,
          imgWidth: 622.5,
          imgHeight: 500,
          parentWidth: 830,
          width: '90%',
          isNoFit: false,
          border: 0,
        },
        loadedIndex: 0,
      },
    };
    const wrapper = shallow<PinZoom>(<PinZoom {...updatedProps} />);
    // toggle comment on
    const header: EnzymePropSelector = wrapper.find('ModalHeader');
    header.props().toggleComments();
    expect(wrapper.state().commentsShowing).toEqual({ height: 925, width: 830 });
    expect(wrapper.state().cancelBlur).toEqual(true);
    // toggle comment off
    header.props().toggleComments();
    expect(wrapper.state().commentsShowing).toEqual(null);
    expect(wrapper.state().cancelBlur).toEqual(false);
  });

  test('will force close the comments window', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    // toggle comment on
    const header: EnzymePropSelector = wrapper.find('ModalHeader');
    header.props().toggleComments();
    const commentsWindow: EnzymePropSelector = wrapper.find('Comments');
    // expect(wrapper.state().show).toBe(true);
    commentsWindow.props().closePin();
    // expect(wrapper.state().show).toBe(false);
  });

  test('will not close the comments window if blur is not cancelled', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    // toggle comment on
    const header: EnzymePropSelector = wrapper.find('ModalHeader');
    header.props().toggleComments();
    // show comments div
    wrapper.setState({ cancelBlur: true });
    const instance = wrapper.instance() as PinZoom;
    instance.close({} as React.SyntheticEvent, false);
  });

  test('will add eventlisteners to listen for scrolling events on mount', () => {
    global.addEventListener = jest.fn();
    const mockedAddEventListener = jest.mocked(global.addEventListener);
    shallow(<PinZoom {...props} />);
    const events = mockedAddEventListener.mock.calls.map((c) => c[0]);
    expect(global.addEventListener).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['scroll']);
  });

  test('will remove eventlisteners and reinstate scroll when modal unloads', () => {
    global.removeEventListener = jest.fn();
    const mockedRemoveEventListener = jest.mocked(global.removeEventListener);
    const wrapper = shallow(<PinZoom {...props} />);
    const instance = wrapper.instance() as PinZoom;
    instance.componentWillUnmount();
    const events = mockedRemoveEventListener.mock.calls.map((c) => c[0]);
    expect(global.removeEventListener).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['scroll']);
  });

  test('will set the image metadata in state', () => {
    const wrapper = shallow<PinZoom>(<PinZoom {...props} />);
    expect(wrapper.state().imgMetaData).toBe(null);
    const img: EnzymePropSelector = wrapper.find('SwipableImage');
    img.props().onSetImageMetaData('image metadata');
    expect(wrapper.state().imgMetaData).toBe('image metadata');
  });

  test('Will set background of card content to black if no fit', () => {
    const updatedProps = {
      ...props,
      zoomInfo: {
        ...props.zoomInfo,
        parentDivStyle: {
          ...props.zoomInfo.parentDivStyle,
          isNoFit: true,
        },
      },
    };
    const wrapper = shallow<PinZoom>(<PinZoom {...updatedProps} />);
    const content: EnzymePropSelector = wrapper.find('ForwardRef(CardContent)');
    expect(content.props().sx.background).toBe('black');
  });
});
