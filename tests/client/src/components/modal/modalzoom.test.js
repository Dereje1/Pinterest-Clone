/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { PinZoom } from '../../../../../client/src/components/modal/modalzoom';
import { pinsStub } from '../../../pinsStub';

describe('The pin zoom modal', () => {
  let props;
  beforeEach(() => {
    props = {
      displayPinZoom: false,
      // [picobject, overlay button type, last scroll distance]
      zoomInfo: [pinsStub[0], 0, 10],
      reset: jest.fn(),
      pinImage: jest.fn(),
      deletePin: null,
    };
  });

  afterEach(() => {
    props = null;
  });

  test('will render', () => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(Date.UTC(2022, 1, 1))); // to fix in snapshot
    const wrapper = shallow(<PinZoom {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will not render if no image information', () => {
    const updatedProps = { ...props, zoomInfo: [] };
    const wrapper = shallow(<PinZoom {...updatedProps} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('will keep the width of image if less than window\'s innerwidth', () => {
    global.innerWidth = 1000;
    global.innerHeight = 1000;
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.instance().handleImage({ target: { naturalWidth: 600, naturalHeight: 800 } });
    expect(wrapper.state().parentDivStyle).toEqual({
      top: 80, width: '600px', small: false, pinnersSize: '3em', subTitleSize: '1.2em', titleSize: '2em',
    });
  });

  test('will adjust the width of image if greater than window\'s innerwidth', () => {
    global.innerWidth = 1000;
    global.innerHeight = 1000;
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.instance().handleImage({ target: { naturalWidth: 1200, naturalHeight: 800 } });
    expect(wrapper.state().parentDivStyle).toEqual({
      top: 80, width: '980px', small: false, pinnersSize: '3em', subTitleSize: '1.2em', titleSize: '2em',
    });
  });

  test('will adjust the width of image if height is greater than window\'s innerheight', () => {
    global.innerWidth = 1000;
    global.innerHeight = 1000;
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.instance().handleImage({ target: { naturalWidth: 600, naturalHeight: 1200 } });
    expect(wrapper.state().parentDivStyle).toEqual({
      top: 80, width: '415px', small: false, pinnersSize: '3em', subTitleSize: '0.9em', titleSize: '1.2em',
    });
  });

  test('will close the zoom window on outclick', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.setState({ show: true });
    const e = {
      target: {
        closest: jest.fn(() => false),
      },
    };
    wrapper.instance().outsideClick(e);
    expect(e.target.closest).toHaveBeenCalledWith('.zoom');
    expect(wrapper.state().show).toBe(false);
  });

  test('will not close the zoom window on outclick if on first load', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.setState({ show: true, firstShow: true });
    const e = {
      target: {
        closest: jest.fn(() => false),
      },
    };
    wrapper.instance().outsideClick(e);
    expect(e.target.closest).toHaveBeenCalledWith('.zoom');
    expect(wrapper.state().show).toBe(true);
    expect(wrapper.state().firstShow).toBe(false);
  });

  test('will disable the scroll', () => {
    global.scrollTo = jest.fn();
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.instance().disableScroll();
    expect(global.scrollTo).toHaveBeenCalledWith(0, 10);
  });

  test('will add eventlisteners and set state when modal first loads', () => {
    global.addEventListener = jest.fn();
    const prevProps = {
      displayPinZoom: false,
      zoomInfo: [pinsStub[1], 0, 10],
    };
    const currentProps = {
      ...props,
      displayPinZoom: true,
    };
    const wrapper = shallow(<PinZoom {...currentProps} />);
    wrapper.instance().componentDidUpdate(prevProps);
    const events = global.addEventListener.mock.calls.map(c => c[0]);
    expect(global.addEventListener).toHaveBeenCalledTimes(3);
    expect(events).toEqual(['click', 'touchmove', 'scroll']);
    expect(wrapper.state()).toEqual({
      show: true,
      firstShow: true,
      parentDivStyle: { top: 10, width: 1000 },
    });
  });

  test('will remove eventlisteners when modal unloads', () => {
    global.removeEventListener = jest.fn();
    const prevProps = {
      displayPinZoom: true,
      zoomInfo: [pinsStub[1], 0, 10],
    };
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.setState({ show: true });
    wrapper.instance().componentDidUpdate(prevProps);
    const events = global.removeEventListener.mock.calls.map(c => c[0]);
    expect(global.removeEventListener).toHaveBeenCalledTimes(3);
    expect(events).toEqual(['click', 'scroll', 'touchmove']);
    expect(wrapper.state().show).toEqual(false);
  });
});
