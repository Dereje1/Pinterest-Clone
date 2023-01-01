import React from 'react';
import { shallow } from 'enzyme';
import HandleThumbnailImage from '../../../../../client/src/components/imagebuild/HandleThumbnailImage';

describe('Handling image action buttons', () => {
  let props;
  beforeEach(() => {
    props = {
      element: {
        hasSaved: false,
      },
      pinImage: jest.fn(),
      deletePin: jest.fn(),
    };
  });

  test('will render the delete button on the user\'s page', () => {
    const updatedProps = {
      ...props,
      pinImage: null,
      element: {
        ...props.element,
        owns: true,
      },
    };
    const wrapper = shallow(<HandleThumbnailImage {...updatedProps} />);
    wrapper.props().onClick();
    expect(wrapper.text()).toBe('Delete');
    expect(props.deletePin).toHaveBeenCalledWith({
      hasSaved: false,
      owns: true,
    });
  });

  test('will render the unpin button on the user\'s page', () => {
    const updatedProps = {
      ...props,
      pinImage: null,
      element: {
        ...props.element,
        owns: false,
        hasSaved: true,
      },
    };
    const wrapper = shallow(<HandleThumbnailImage {...updatedProps} />);
    wrapper.props().onClick();
    expect(wrapper.text()).toBe('Unpin');
    expect(props.deletePin).toHaveBeenCalledWith({
      hasSaved: true,
      owns: false,
    });
  });

  test('will not render any action buttons for owner', () => {
    const updatedProps = {
      ...props,
      element: {
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
      element: {
        ...props.element,
        owns: false,
        hasSaved: true,
      },
    };
    const wrapper = shallow(<HandleThumbnailImage {...updatedProps} />);
    wrapper.props().onClick();
    expect(wrapper.text()).toBe('Unpin');
    expect(updatedProps.pinImage).toHaveBeenCalledWith({
      hasSaved: true,
      owns: false,
    });
  });

  test('will render the save button', () => {
    const wrapper = shallow(<HandleThumbnailImage {...props} />);
    wrapper.props().onClick();
    expect(wrapper.text()).toBe(' Save');
    expect(props.pinImage).toHaveBeenCalledWith({
      hasSaved: false,
    });
  });
});
