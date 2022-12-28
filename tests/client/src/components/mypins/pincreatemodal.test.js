/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import PinCreate from '../../../../../client/src/components/mypins/pincreatemodal';
import * as utils from '../../../../../client/src/utils/utils';

jest.mock('../../../../../client/src/components/mypins/error.png', () => '/load-error.png');
jest.useFakeTimers();

describe('The pin creation modal', () => {
  let props;
  beforeEach(() => {
    props = {
      userInfo: {
        authenticated: true,
        displayName: 'tester displayName',
        username: 'tester username',
        service: 'tester service',
        userId: 'tester user Id',
      },
      message: true,
      allPinLinks: [{ imgLink: 'https://duplicate.com' }],
      reset: jest.fn(),
      savePin: jest.fn(),
    };
    global.scrollTo = jest.fn();
  });
  afterEach(() => {
    props = null;
    global.scrollTo = null;
  });

  test('will render for links to images', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for uploading images', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    let cardHeader = wrapper.find('ForwardRef(CardHeader)');
    expect(cardHeader.props().title).toBe('Create pin from link');
    const uploadSwitch = cardHeader.props().action.props.children[0].props.control.props;
    uploadSwitch.onChange();
    cardHeader = wrapper.find('ForwardRef(CardHeader)');
    expect(cardHeader.props().title).toBe('Create pin from file');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will handle errors in images', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ isError: false });
    expect(wrapper.state().isError).toBe(false);
    const img = wrapper.find({ id: 'new-pin-image' });
    img.props().onError();
    expect(wrapper.state().isError).toBe(true);
  });

  test('will handle a loaded image with an error', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ isLoaded: false });
    expect(wrapper.state().isLoaded).toBe(false);
    const img = wrapper.find({ id: 'new-pin-image' });
    img.props().onLoad({ target: { currentSrc: 'http://localhost/load-error.png' } });
    expect(wrapper.state().isLoaded).toBe(true);
    expect(wrapper.state().isError).toBe(true);
  });

  test('will handle a loaded image without an error', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ isLoaded: false });
    expect(wrapper.state().isLoaded).toBe(false);
    const img = wrapper.find({ id: 'new-pin-image' });
    img.props().onLoad({ target: { currentSrc: 'valid' } });
    expect(wrapper.state().isLoaded).toBe(true);
    expect(wrapper.state().isError).toBe(false);
  });

  test('will handle changes in description', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    const description = wrapper.find({ id: 'pin-description' });
    description.props().onChange({ target: { value: 'abc' } });
    expect(wrapper.state().description).toBe('abc');
  });

  test('will handle changes in image links', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    const imgLink = wrapper.find({ id: 'pin-img-link' });
    imgLink.props().onChange({ target: { value: 'https://abc.com' } });
    expect(wrapper.state().picPreview).toBe('https://abc.com');
  });

  test('will handle changes in image links with http', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    const imgLink = wrapper.find({ id: 'pin-img-link' });
    imgLink.props().onChange({ target: { value: 'http://abc.com' } });
    expect(wrapper.state().picPreview).toBe('https://abc.com');
  });

  test('will handle changes in image links with data protocol', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    const imgLink = wrapper.find({ id: 'pin-img-link' });
    imgLink.props().onChange({ target: { value: 'data:abc.com' } });
    expect(wrapper.state().picPreview).toBe('data:abc.com');
  });

  test('will handle changes in image links with invalid url', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    const imgLink = wrapper.find({ id: 'pin-img-link' });
    imgLink.props().onChange({ target: { value: 'htt://abc.com' } });
    expect(wrapper.state().picPreview).toBe('');
  });

  test('will detect duplicate pins', async () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({
      picPreview: 'https://duplicate.com',
      description: 'abcde',
      showErrorImage: false,
    });
    const SavePin = wrapper.find('SavePin');
    expect(SavePin.props().isDuplicateError).toBe(true);
  });

  test('will handle successfully uploading images', async () => {
    utils.encodeImageFileAsURL = jest.fn(() => Promise.resolve('data:image successfully encoded'));
    const wrapper = shallow(<PinCreate {...props} />);
    // turn upload switch on
    const cardHeader = wrapper.find('ForwardRef(CardHeader)');
    const uploadSwitch = cardHeader.props().action.props.children[0].props.control.props;

    wrapper.setState({ isLoaded: true, isError: true });
    uploadSwitch.onChange();
    await wrapper.instance().handleUploadedImage({ target: { files: ['an image'] } });
    expect(wrapper.state().picPreview).toBe('data:image successfully encoded');
    expect(wrapper.state().isError).toBe(false);
    expect(wrapper.state().isLoaded).toBe(false);
  });

  test('will handle uploading image failures', async () => {
    utils.encodeImageFileAsURL = jest.fn(() => Promise.reject(new Error()));
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({ isLoaded: true, isError: false, picPreview: 'stub_url' });
    await wrapper.instance().handleUploadedImage({ target: { files: ['an image'] } });
    expect(wrapper.state().picPreview).toBe('');
    expect(wrapper.state().isError).toBe(true);
    expect(wrapper.state().isLoaded).toBe(false);
  });

  test('will save valid pins', async () => {
    const wrapper = shallow(<PinCreate {...props} />);
    wrapper.setState({
      picPreview: 'https://abc.com',
      description: 'abcde',
      showErrorImage: false,
    });
    const SavePin = wrapper.find('SavePin');
    expect(SavePin.props().isDuplicateError).toBe(false);
    SavePin.props().savePic();
    jest.advanceTimersByTime(500);
    await Promise.resolve();
    expect(props.savePin).toHaveBeenCalledWith({
      imgDescription: 'abcde',
      imgLink: 'https://abc.com',
    });
    expect(wrapper.state()).toMatchObject({
      picPreview: '',
      description: '',
    });
    expect(props.reset).toHaveBeenCalledTimes(1);
  });
});
