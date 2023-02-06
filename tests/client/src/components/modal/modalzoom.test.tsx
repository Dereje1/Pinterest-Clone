/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { PinZoom, StyledBadge } from '../../../../../client/src/components/modal/modalzoom';
import { pinsStub } from '../../../stub';

jest.useFakeTimers();

describe('The pin zoom modal', () => {
  let props;
  const focus = jest.fn();
  beforeEach(() => {
    jest.spyOn(React, 'createRef').mockImplementation(() => ({
      current: {
        focus,
        clientHeight: 50,
        children: [{}, {
          clientHeight: 25,
        }],
      },
    }));
    props = {
      displayPinZoom: false,
      // [picobject, overlay button type, last scroll distance]
      zoomInfo: {
        pin: pinsStub[0],
        parentDivStyle: {
          top: 10,
          imgWidth: '622.5px',
          parentWidth: 622.5,
          pinnersSize: '2em',
          subTitleSize: '1.2em',
          titleSize: '2em',
          dateSize: '0.6em',
          width: '90%',
          isNoFit: false,
        },
      },
      reset: jest.fn(),
      pinImage: jest.fn(),
      deletePin: null,
      handleNewComment: jest.fn(),
      user: { authenticated: true },
      updateTags: jest.fn(),
    };
  });

  afterEach(() => {
    props = null;
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
          imgWidth: '622.5px',
          parentWidth: 830,
          pinnersSize: '2em',
          subTitleSize: '1.2em',
          titleSize: '2em',
          dateSize: '0.6em',
          width: '90%',
          isNoFit: false,
        },
      },
    };
    const wrapper = shallow<PinZoom>(<PinZoom {...updatedProps} />);
    // toggle comment on
    let commentIcon: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    commentIcon = commentIcon.props().action.props.children[0].props.children.props;
    commentIcon.onClick();
    commentIcon.onMouseDown({ preventDefault: jest.fn() });
    expect(wrapper.state().commentsShowing).toEqual({ height: 950, width: 830 });
    expect(wrapper.state().cancelBlur).toEqual(true);
    // toggle comment off
    commentIcon.onClick();
    expect(wrapper.state().commentsShowing).toEqual(null);
    expect(wrapper.state().cancelBlur).toEqual(false);
  });

  test('will force close the comments window', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    // toggle comment on
    let commentIcon: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    commentIcon = commentIcon.props().action.props.children[0].props.children.props;
    commentIcon.onClick();
    const commentsWindow: EnzymePropSelector = wrapper.find('Comments');
    // expect(wrapper.state().show).toBe(true);
    commentsWindow.props().closePin();
    // expect(wrapper.state().show).toBe(false);
  });

  test('will not close the comments window if blur is not cancelled', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    // toggle comment on
    let commentIcon: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    commentIcon = commentIcon.props().action.props.children[0].props.children.props;
    // show comments div
    commentIcon.onClick();
    wrapper.setState({ cancelBlur: true });
    const instance = wrapper.instance() as PinZoom;
    instance.close({} as React.SyntheticEvent, false);
  });

  test('will set zero on badge content for pins icon if savedby is not defined', () => {
    const updatedProps = {
      ...props,
      zoomInfo: {
        ...props.zoomInfo,
        pin: {
          ...pinsStub[0],
          savedBy: undefined,
        },
      },
    };
    const wrapper = shallow(<PinZoom {...updatedProps} />);
    // toggle comment on
    let pinsIcon: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    pinsIcon = pinsIcon
      .props()
      .action
      .props
      .children[1]
      .props;
    expect(pinsIcon.badgeContent).toBe(0);
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

  test('will include a link to the profile of the owner in the subheader and close modal on click', async () => {
    const wrapper = shallow(<PinZoom {...props} />);
    const cardHeader: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    const link = cardHeader.props().subheader.props.children[0].props;
    link.onMouseDown({ preventDefault: jest.fn() });
    link.onClick();
    jest.advanceTimersByTime(500);
    await Promise.resolve();
    expect(link.to).toBe('/profile/1');
    expect(props.reset).toHaveBeenCalledTimes(1);
  });
});

describe('The styled badge', () => {
  test('Will render for pins', () => {
    const badge = shallow(<StyledBadge name="pin" />);
    expect(toJson(badge)).toMatchSnapshot();
  });

  test('Will render for comments', () => {
    const badge = shallow(<StyledBadge name="comments" />);
    expect(toJson(badge)).toMatchSnapshot();
  });
});
