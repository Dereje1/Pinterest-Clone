/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { PinZoom } from '../../../../../client/src/components/modal/modalzoom';
import { pinsStub } from '../../../pinsStub';

jest.useFakeTimers();

describe('The pin zoom modal', () => {
  let props;
  const focus = jest.fn();
  beforeEach(() => {
    jest.spyOn(React, 'createRef').mockImplementation(() => ({
      current: {
        focus,
      },
    }));
    global.scrollTo = jest.fn();
    props = {
      displayPinZoom: false,
      // [picobject, overlay button type, last scroll distance]
      zoomInfo: [pinsStub[0], 10],
      reset: jest.fn(),
      pinImage: jest.fn(),
      deletePin: null,
      user: {},
      handleNewComment: jest.fn(),
    };
  });

  afterEach(() => {
    props = null;
    focus.mockClear();
    global.scrollTo = null;
  });

  test('will render', () => {
    const wrapper = shallow(<PinZoom {...props} />);
    expect(focus).toHaveBeenCalled();
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
      top: 10,
      imgWidth: '622.5px',
      parentWidth: 622.5,
      pinnersSize: '2em',
      subTitleSize: '1.2em',
      titleSize: '2em',
      dateSize: '0.6em',
      width: '90%',
    });
  });

  test('will adjust the width of image if greater than window\'s innerwidth', () => {
    global.innerWidth = 1000;
    global.innerHeight = 1000;
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.instance().handleImage({ target: { naturalWidth: 1200, naturalHeight: 800 } });
    expect(wrapper.state().parentDivStyle).toEqual({
      top: 10,
      imgWidth: '980px',
      pinnersSize: '2em',
      subTitleSize: '1.2em',
      titleSize: '2em',
      dateSize: '0.6em',
      parentWidth: 980,
      width: '90%',
    });
  });

  test('will adjust the width of image if height is greater than window\'s innerheight', () => {
    global.innerWidth = 1000;
    global.innerHeight = 1000;
    const wrapper = shallow(<PinZoom {...props} />);
    wrapper.instance().handleImage({ target: { naturalWidth: 600, naturalHeight: 1200 } });
    expect(wrapper.state().parentDivStyle).toEqual({
      top: 10,
      imgWidth: '415px',
      pinnersSize: '2em',
      subTitleSize: '0.9em',
      titleSize: '1.2em',
      dateSize: '0.45em',
      parentWidth: 500,
      width: '90%',
    });
  });

  test('will close the zoom window on blur', async () => {
    const wrapper = shallow(<PinZoom {...props} />);
    const zoomCard = wrapper.find({ className: 'zoom cshow' });
    wrapper.setState({ firstShow: false });
    zoomCard.props().onBlur();
    jest.advanceTimersByTime(500);
    await Promise.resolve();

    expect(wrapper.state().show).toBe(false);
    expect(props.reset).toHaveBeenCalledTimes(1);
  });

  test('will disable the scroll', () => {
    global.scrollTo = jest.fn();
    shallow(<PinZoom {...props} />);
    expect(global.scrollTo).toHaveBeenCalledWith(0, 10);
  });
});
