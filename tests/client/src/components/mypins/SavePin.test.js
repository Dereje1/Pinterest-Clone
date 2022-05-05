/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import SavePin from '../../../../../client/src/components/mypins/SavePin';

describe('The save pin action button', () => {
  let props;
  beforeEach(() => {
    props = {
      isImageError: true,
      isDescriptionError: true,
      isDuplicateError: false,
      savePic: jest.fn(),
    };
  });
  afterEach(() => {
    props = null;
  });

  test('will render with both errors', () => {
    const wrapper = shallow(<SavePin {...props} />);
    const validation = wrapper.find({ id: 'pin-create-validation' });
    expect(validation.props().value).toBe('Invalid image and description');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with image error only', () => {
    const updatedProps = {
      ...props,
      isDescriptionError: false,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    const validation = wrapper.find({ id: 'pin-create-validation' });
    expect(validation.props().value).toBe('Invalid image');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with description error only', () => {
    const updatedProps = {
      ...props,
      isImageError: false,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    const validation = wrapper.find({ id: 'pin-create-validation' });
    expect(validation.props().value).toBe('Invalid description');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with duplicate error only', () => {
    const updatedProps = {
      ...props,
      isDescriptionError: false,
      isImageError: false,
      isDuplicateError: true,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    const validation = wrapper.find({ id: 'pin-create-validation' });
    expect(validation.props().value).toBe('Image URL already exists, please choose another');
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with no errors', () => {
    const updatedProps = {
      ...props,
      isImageError: false,
      isDescriptionError: false,
    };
    const wrapper = shallow(<SavePin {...updatedProps} />);
    const validation = wrapper.find({ id: 'pin-create-validation' });
    expect(validation.props().value).toBe('Save pin');
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
