import React from 'react';
import { shallow } from 'enzyme';
import HandleThumbnailImage from '../../../../../client/src/components/imagebuild/HandleThumbnailImage';
import { pinsStub } from '../../../stub';

describe('Handling image action buttons', () => {
  let props: React.ComponentProps<typeof HandleThumbnailImage>;
  beforeEach(() => {
    props = {
      pin: {
        ...pinsStub[0],
      },
      pinImage: jest.fn(),
      deletePin: jest.fn(),
    };
  });

  test('will render the delete button on the user\'s page', () => {
    const updatedProps = {
      ...props,
      pinImage: jest.fn(),
      pin: {
        ...props.pin,
        owns: true,
      },
    };
    const wrapper = shallow(<HandleThumbnailImage {...updatedProps} />);
    wrapper.props().onClick();
    expect(wrapper.text()).toBe('Delete');
    expect(props.deletePin).toHaveBeenCalledWith({
      ...props.pin,
      hasSaved: false,
      owns: true,
    });
  });

  test('will render the unpin button on the user\'s page', () => {
    const updatedProps = {
      ...props,
      pinImage: jest.fn(),
      pin: {
        ...props.pin,
        owns: false,
        hasSaved: true,
      },
    };
    const wrapper = shallow(<HandleThumbnailImage {...updatedProps} />);
    wrapper.props().onClick();
    expect(wrapper.text()).toBe('Unpin');
    expect(props.deletePin).toHaveBeenCalledWith({
      ...props.pin,
      hasSaved: true,
      owns: false,
    });
  });

  test('will not render any action buttons for owner', () => {
    const updatedProps = {
      ...props,
      deletePin: null,
      pin: {
        ...props.pin,
        owns: true,
      },
    };
    const wrapper = shallow(<HandleThumbnailImage {...updatedProps} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('will render the unpin button on the home page', () => {
    const updatedProps = {
      ...props,
      deletePin: null,
      pinImage: jest.fn(),
      pin: {
        ...props.pin,
        owns: false,
        hasSaved: true,
      },
    };
    const wrapper = shallow(<HandleThumbnailImage {...updatedProps} />);
    wrapper.props().onClick();
    expect(wrapper.text()).toBe('Unpin');
    expect(updatedProps.pinImage).toHaveBeenCalledWith({
      ...props.pin,
      hasSaved: true,
      owns: false,
    });
  });

  test('will render the save button', () => {
    const updatedProps = {
      ...props,
      deletePin: null,
      pin: {
        ...props.pin,
        owns: false,
        hasSaved: false,
      },
    };
    const wrapper = shallow(<HandleThumbnailImage {...updatedProps} />);
    wrapper.props().onClick();
    expect(wrapper.text()).toBe(' Save');
    expect(props.pinImage).toHaveBeenCalledWith({
      ...props.pin,
      hasSaved: false,
      owns: false,
    });
  });
});
