/**
 * @jest-environment jsdom
 */
/* eslint-disable no-import-assign */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import PinCreate from '../../../../../client/src/components/mypins/pincreatemodal';
import * as utils from '../../../../../client/src/utils/utils';
import RESTcall from '../../../../../client/src/crud';

jest.mock('../../../../../client/src/components/mypins/error.png', () => '/load-error.png');
jest.useFakeTimers();
jest.mock('../../../../../client/src/crud');
const mockedRESTcall = jest.mocked(RESTcall);

describe('The pin creation modal', () => {
  let props: React.ComponentProps<typeof PinCreate>;
  beforeEach(() => {
    props = {
      reset: jest.fn(),
      savePin: jest.fn(),
      totalAiGenratedImages: 1,
      updateGeneratedImages: jest.fn(),
    };
  });

  afterEach(() => {
    mockedRESTcall.mockClear();
  });

  test('will render for links to images', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for uploading images', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    const cardHeader: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    let dialogTitle = wrapper.find('ForwardRef(DialogTitle)');
    expect(dialogTitle.text()).toBe('Create pin: Web link');
    cardHeader.props().action.props.handleMediaChange('', 'upload');
    dialogTitle = wrapper.find('ForwardRef(DialogTitle)');
    expect(dialogTitle.text()).toBe('Create pin: File/device');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will handle errors in images', () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    wrapper.setState({ isError: false });
    expect(wrapper.state().isError).toBe(false);
    const img = wrapper.find({ id: 'new-pin-image' });
    img.props().onError();
    expect(wrapper.state().isError).toBe(true);
  });

  test('will handle a loaded image with an error', () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    wrapper.setState({ isLoaded: false });
    expect(wrapper.state().isLoaded).toBe(false);
    const img = wrapper.find({ id: 'new-pin-image' });
    img.props().onLoad({ target: { currentSrc: 'http://localhost/load-error.png' } });
    expect(wrapper.state().isLoaded).toBe(true);
    expect(wrapper.state().isError).toBe(true);
  });

  test('will handle a loaded image without an error', () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    wrapper.setState({ isLoaded: false });
    expect(wrapper.state().isLoaded).toBe(false);
    const img = wrapper.find({ id: 'new-pin-image' });
    img.props().onLoad({ target: { currentSrc: 'valid' } });
    expect(wrapper.state().isLoaded).toBe(true);
    expect(wrapper.state().isError).toBe(false);
  });

  test('will handle changes in description', () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    const description = wrapper.find({ id: 'pin-description' });
    description.props().onChange({ target: { value: 'abc' } });
    expect(wrapper.state().description).toBe('abc');
  });

  test('will handle changes in image links', () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    const MediaButtonHandler: EnzymePropSelector = wrapper.find('MediaButtonHandler');
    MediaButtonHandler.props().handleLinkImage({ target: { value: 'https://abc.com' } });
    expect(wrapper.state().picPreview).toBe('https://abc.com');
  });

  test('will handle changes in image links with http', () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    const MediaButtonHandler: EnzymePropSelector = wrapper.find('MediaButtonHandler');
    MediaButtonHandler.props().handleLinkImage({ target: { value: 'http://abc.com' } });
    expect(wrapper.state().picPreview).toBe('https://abc.com');
  });

  test('will handle changes in image links with data protocol', () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    const MediaButtonHandler: EnzymePropSelector = wrapper.find('MediaButtonHandler');
    MediaButtonHandler.props().handleLinkImage({ target: { value: 'data:abc.com' } });
    expect(wrapper.state().picPreview).toBe('data:abc.com');
  });

  test('will handle changes in image links with invalid url', () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    const MediaButtonHandler: EnzymePropSelector = wrapper.find('MediaButtonHandler');
    MediaButtonHandler.props().handleLinkImage({ target: { value: 'htt://abc.com' } });
    expect(wrapper.state().picPreview).toBe('');
  });

  test('will handle successfully uploading images', async () => {
    jest
      .spyOn(utils, 'encodeImageFileAsURL')
      .mockImplementationOnce(() => Promise.resolve('data:image successfully encoded'));
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    // turn upload switch on
    const cardHeader: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    cardHeader.props().action.props.handleMediaChange('', 'upload');
    const instance = wrapper.instance() as PinCreate;
    // TODO: Fix is any declaration
    await instance.handleUploadedImage(
      { target: { files: ['a file'] } } as unknown as React.SyntheticEvent<HTMLDivElement>,
    );
    wrapper.setState({ isError: false });
    expect(wrapper.state().picPreview).toBe('data:image successfully encoded');
  });

  test('will handle uploading image failures', async () => {
    jest
      .spyOn(utils, 'encodeImageFileAsURL')
      .mockImplementationOnce(() => Promise.reject(new Error()));
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    wrapper.setState({ isLoaded: true, isError: false, picPreview: 'stub_url' });
    const instance = wrapper.instance() as PinCreate;
    // TODO: Fix is any declaration
    await instance.handleUploadedImage(
      { target: { files: ['a file'] } } as unknown as React.SyntheticEvent<HTMLDivElement>,
    );
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
    const SavePin: EnzymePropSelector = wrapper.find('SavePin');
    SavePin.props().savePic();
    jest.advanceTimersByTime(500);
    await Promise.resolve();
    expect(props.savePin).toHaveBeenCalledWith({
      imgDescription: 'abcde',
      imgLink: 'https://abc.com',
      AIgeneratedId: null,
    });
    expect(wrapper.state()).toMatchObject({
      picPreview: '',
      description: '',
    });
    expect(props.reset).toHaveBeenCalledTimes(1);
  });

  test('will close the dialog', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    const closeButton = wrapper.find({ id: 'close-pin-create-modal' });
    closeButton.props().onClick();
    const color = closeButton.props().sx.color({ palette: { grey: { 50: 'palette color' } } });
    expect(props.reset).toHaveBeenCalledTimes(1);
    expect(color).toBe('palette color');
  });

  test('will render for generating AI images selection', () => {
    const wrapper = shallow(<PinCreate {...props} />);
    const cardHeader: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    let dialogTitle = wrapper.find('ForwardRef(DialogTitle)');
    expect(dialogTitle.text()).toBe('Create pin: Web link');
    cardHeader.props().action.props.handleMediaChange('', 'AI');
    dialogTitle = wrapper.find('ForwardRef(DialogTitle)');
    expect(dialogTitle.text()).toBe('Create pin: AI');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will show warning dialog while switching media type if an AI image has already generated', () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    const cardHeader: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    let dialogTitle = wrapper.find('ForwardRef(DialogTitle)');
    cardHeader.props().action.props.handleMediaChange('', 'AI');
    dialogTitle = wrapper.find('ForwardRef(DialogTitle)');
    expect(dialogTitle.text()).toBe('Create pin: AI');
    expect(wrapper.state().showAIResetDialog).toBe(false);
    wrapper.setState({
      AIimageStatus: {
        generatedImage: true,
        generatingImage: false,
        _id: null,
      },
    });
    cardHeader.props().action.props.handleMediaChange('', 'link');
    expect(wrapper.state().showAIResetDialog).toBe(true);
  });

  test('will generate AI images', async () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    const cardHeader: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    cardHeader.props().action.props.handleMediaChange('', 'AI');
    const textField: EnzymePropSelector = wrapper.find('ForwardRef(TextField)');
    const generateButton: EnzymePropSelector = wrapper.find('MediaButtonHandler');
    // set the prompt
    textField.props().onChange({ target: { value: 'A prompt to generate image' } });
    // generate click
    generateButton.props().handleAIimage();
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall.mock.calls).toEqual([
      [{
        address: '/api/AIimage',
        method: 'post',
        payload: { description: 'A prompt to generate image' },
      }],
    ]);
    expect(wrapper.state().AIimageStatus).toEqual({
      _id: null,
      generatedImage: false,
      generatingImage: true,
    });
    expect(wrapper.state().picPreview).toEqual('/load-error.png');
    expect(wrapper.state().description).toEqual('A prompt to generate image');
    // resolve api call to endpoint
    await Promise.resolve();
    expect(wrapper.state().AIimageStatus).toEqual({
      _id: 'Ai_generated_ID',
      generatedImage: true,
      generatingImage: false,
    });
    expect(wrapper.state().picPreview).toEqual('AI generated image url');
    expect(wrapper.state().description).toEqual('AI generated title');
    expect(props.updateGeneratedImages).toHaveBeenCalled();
  });

  test('will reset a generated image', async () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    const cardHeader: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    cardHeader.props().action.props.handleMediaChange('', 'AI');
    const textField: EnzymePropSelector = wrapper.find('ForwardRef(TextField)');
    const generateButton: EnzymePropSelector = wrapper.find('MediaButtonHandler');
    // set the prompt
    textField.props().onChange({ target: { value: 'A prompt to generate image' } });
    // generate click
    generateButton.props().handleAIimage();
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall.mock.calls).toEqual([
      [{
        address: '/api/AIimage',
        method: 'post',
        payload: { description: 'A prompt to generate image' },
      }],
    ]);
    expect(wrapper.state().AIimageStatus).toEqual({
      _id: null,
      generatedImage: false,
      generatingImage: true,
    });
    // resolve api call to endpoint
    await Promise.resolve();
    expect(wrapper.state().AIimageStatus).toEqual({
      _id: 'Ai_generated_ID',
      generatedImage: true,
      generatingImage: false,
    });
    // open warning dialog
    generateButton.props().showAIResetDialog();
    // reset generated image
    const warningDialog: EnzymePropSelector = wrapper.find('WarningDialog');
    expect(warningDialog.props().title).toBe('Warning: This will permanently delete the generated image, AI generated title, and you will have 4 tries left to generate a new image. Are you sure you want to continue?');
    warningDialog.props().handleContinue();
    expect(wrapper.state().AIimageStatus).toEqual({
      _id: null,
      generatedImage: false,
      generatingImage: false,
    });
  });

  test('will cancel the reset of a generated image', async () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    const cardHeader: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    cardHeader.props().action.props.handleMediaChange('', 'AI');
    const textField: EnzymePropSelector = wrapper.find('ForwardRef(TextField)');
    const generateButton: EnzymePropSelector = wrapper.find('MediaButtonHandler');
    // set the prompt
    textField.props().onChange({ target: { value: 'A prompt to generate image' } });
    // generate click
    generateButton.props().handleAIimage();
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall.mock.calls).toEqual([
      [{
        address: '/api/AIimage',
        method: 'post',
        payload: { description: 'A prompt to generate image' },
      }],
    ]);
    expect(wrapper.state().AIimageStatus).toEqual({
      _id: null,
      generatedImage: false,
      generatingImage: true,
    });
    // resolve api call to endpoint
    await Promise.resolve();
    expect(wrapper.state().AIimageStatus).toEqual({
      _id: 'Ai_generated_ID',
      generatedImage: true,
      generatingImage: false,
    });
    // open warning dialog
    generateButton.props().showAIResetDialog();
    // reset generated image
    const warningDialog: EnzymePropSelector = wrapper.find('WarningDialog');
    expect(warningDialog.props().title).toBe('Warning: This will permanently delete the generated image, AI generated title, and you will have 4 tries left to generate a new image. Are you sure you want to continue?');
    warningDialog.props().handleCancel();
    expect(wrapper.state().AIimageStatus).toEqual({
      _id: 'Ai_generated_ID',
      generatedImage: true,
      generatingImage: false,
    });
  });

  test('will apply exclusive selection for the toggle button group', () => {
    const wrapper = shallow<PinCreate>(<PinCreate {...props} />);
    const cardHeader: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    let dialogTitle = wrapper.find('ForwardRef(DialogTitle)');
    expect(dialogTitle.text()).toBe('Create pin: Web link');
    cardHeader.props().action.props.handleMediaChange('', null);
    dialogTitle = wrapper.find('ForwardRef(DialogTitle)');
    expect(dialogTitle.text()).toBe('Create pin: Web link');
    // handles default case of switch/case
    cardHeader.props().action.props.handleMediaChange('', 'any');
    // expect(wrapper.instance().handleImageTypes()).toBe(null);
  });
});
