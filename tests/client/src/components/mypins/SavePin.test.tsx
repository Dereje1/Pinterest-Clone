/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import SavePin from '../../../../../client/src/components/mypins/SavePin';
import RESTcall from '../../../../../client/src/crud';

jest.mock('../../../../../client/src/crud');
const mockedRESTcall = jest.mocked(RESTcall);

describe('The save pin action button', () => {
  let props: React.ComponentProps<typeof SavePin>;
  beforeEach(() => {
    props = {
      isImageError: true,
      isDescriptionError: true,
      isImageLoaded: true,
      savePic: jest.fn(),
      picPreview: '',
    };
  });

  test('will render for a pending preview that is loading', () => {
    const updatedProps = {
      ...props,
      isImageError: false,
      isDescriptionError: false,
      isImageLoaded: false,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Image loading...');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for an image and description eror', () => {
    const wrapper = shallow(<SavePin {...props} />);
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Invalid image and description');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for an image error only', () => {
    const updatedProps = {
      ...props,
      isDescriptionError: false,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Invalid image');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for a description error only', () => {
    const updatedProps = {
      ...props,
      isImageError: false,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Invalid description');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for a pending duplicate error call', async () => {
    const updatedProps = {
      ...props,
      isImageError: false,
      isDescriptionError: false,
      isImageLoaded: true,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Processing...');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for a failed duplicate error call', async () => {
    mockedRESTcall.mockImplementationOnce(() => Promise.reject());
    const updatedProps = {
      ...props,
      isImageError: false,
      isDescriptionError: false,
      isImageLoaded: true,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    await Promise.resolve();
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Error processing...');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for a duplicate found error', async () => {
    const updatedProps = {
      ...props,
      isDescriptionError: false,
      isImageError: false,
      isImageLoaded: true,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    await Promise.resolve();
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Image URL already exists');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for no errors and ready to submit', async () => {
    mockedRESTcall.mockImplementationOnce(() => Promise.resolve({ duplicateError: false }));
    const updatedProps = {
      ...props,
      isImageError: false,
      isDescriptionError: false,
      isImageLoaded: true,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    await Promise.resolve();
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Save pin');
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
