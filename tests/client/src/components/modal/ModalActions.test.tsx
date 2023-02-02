import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ModalActions from '../../../../../client/src/components/modal/ModalActions';

describe('Handling zoomed image action buttons', () => {
  let props;
  beforeEach(() => {
    props = {
      element: {
        hasSaved: false,
        owns: false,
      },
      pinImage: jest.fn(),
      deletePin: jest.fn(),
      reset: jest.fn(),
    };
  });

  afterEach(() => {
    props = null;
  });

  test('will render the delete button for owners', () => {
    const updatedProps = {
      ...props,
      element: {
        hasSaved: false,
        owns: true,
      },
      pinImage: null,
    };
    const preventDefault = jest.fn();
    const wrapper = shallow(<ModalActions {...updatedProps} />);
    const iconButton: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    iconButton.props().onClick();
    iconButton.props().onMouseDown({ preventDefault });
    expect(props.deletePin).toHaveBeenCalledWith({
      hasSaved: false,
      owns: true,
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(props.reset).toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the delete button for pinned images', () => {
    const updatedProps = {
      ...props,
      element: {
        hasSaved: false,
        owns: false,
      },
      pinImage: null,
    };
    const wrapper = shallow(<ModalActions {...updatedProps} />);
    const iconButton: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    iconButton.props().onClick();
    expect(props.deletePin).toHaveBeenCalledWith({
      hasSaved: false,
      owns: false,
    });
    expect(props.reset).toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the unpin button for already pinned images', () => {
    const updatedProps = {
      ...props,
      deletePin: null,
      element: {
        hasSaved: true,
        owns: false,
      },
    };

    const wrapper = shallow(<ModalActions {...updatedProps} />);
    const preventDefault = jest.fn();
    const iconButton: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    iconButton.props().onClick();
    iconButton.props().onMouseDown({ preventDefault });
    expect(props.pinImage).toHaveBeenCalledWith({
      hasSaved: true,
      owns: false,
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(props.reset).not.toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the disabled pin button for already owned images', () => {
    const updatedProps = {
      ...props,
      element: {
        hasSaved: false,
        owns: true,
      },
    };
    const wrapper = shallow(<ModalActions {...updatedProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the pin button for unpinned images', () => {
    const preventDefault = jest.fn();
    const updatedProps = { ...props, deletePin: null };
    const wrapper = shallow(<ModalActions {...updatedProps} />);
    const iconButton: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    iconButton.props().onClick();
    iconButton.props().onMouseDown({ preventDefault });
    expect(props.pinImage).toHaveBeenCalledWith({
      hasSaved: false,
      owns: false,
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(props.reset).not.toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
