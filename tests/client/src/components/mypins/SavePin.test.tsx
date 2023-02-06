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
  let props;
  beforeEach(() => {
    props = {
      isImageError: true,
      isDescriptionError: true,
      isDuplicateError: false,
      isImageLoaded: true,
      savePic: jest.fn(),
    };
  });
  afterEach(() => {
    props = null;
  });

  test('will render with both errors', () => {
    const wrapper = shallow(<SavePin {...props} />);
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Invalid image and description');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with image error only', () => {
    const updatedProps = {
      ...props,
      isDescriptionError: false,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Invalid image');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with description error only', () => {
    const updatedProps = {
      ...props,
      isImageError: false,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    const validation = wrapper.find({ 'aria-label': 'Pin Image' });
    expect(validation.text()).toBe('Invalid description');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with duplicate error only', async () => {
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

  test('will render with not yet loaded error only', () => {
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

  test('will render with no errors', async () => {
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