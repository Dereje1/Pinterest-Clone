import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ModalActions from '../../../../../client/src/components/modal/ModalActions';
import { pinsStub } from '../../../stub';

describe('Handling zoomed image action buttons', () => {
  let props: React.ComponentProps<typeof ModalActions>;
  beforeEach(() => {
    props = {
      element: {
        ...pinsStub[0],
        hasSaved: false,
        owns: false,
      },
      pinImage: jest.fn(),
      deletePin: null,
      reset: jest.fn(),
    };
  });

  test('will render the delete button for owners', () => {
    const updatedProps = {
      ...props,
      element: {
        ...props.element,
        hasSaved: false,
        owns: true,
      },
      deletePin: jest.fn(),
    };
    const preventDefault = jest.fn();
    const wrapper = shallow(<ModalActions {...updatedProps} />);
    const iconButton: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    iconButton.props().onClick();
    iconButton.props().onMouseDown({ preventDefault });
    expect(updatedProps.deletePin).toHaveBeenCalledWith({ ...updatedProps.element });
    expect(preventDefault).toHaveBeenCalled();
    expect(props.reset).toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the delete button for pinned images', () => {
    const updatedProps = {
      ...props,
      element: {
        ...props.element,
        hasSaved: true,
        owns: false,
      },
      deletePin: jest.fn(),
    };
    const wrapper = shallow(<ModalActions {...updatedProps} />);
    const iconButton: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    iconButton.props().onClick();
    expect(updatedProps.deletePin).toHaveBeenCalledWith({ ...updatedProps.element });
    expect(props.reset).toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the unpin button for already pinned images', () => {
    const updatedProps = {
      ...props,
      deletePin: null,
      element: {
        ...props.element,
        hasSaved: true,
        owns: false,
      },
    };

    const wrapper = shallow(<ModalActions {...updatedProps} />);
    const preventDefault = jest.fn();
    const iconButton: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    iconButton.props().onClick();
    iconButton.props().onMouseDown({ preventDefault });
    expect(props.pinImage).toHaveBeenCalledWith({ ...updatedProps.element });
    expect(preventDefault).toHaveBeenCalled();
    expect(props.reset).not.toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the disabled pin button for already owned images', () => {
    const updatedProps = {
      ...props,
      element: {
        ...props.element,
        hasSaved: false,
        owns: true,
      },
      deletePin: null,
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
    expect(props.pinImage).toHaveBeenCalledWith({ ...props.element });
    expect(preventDefault).toHaveBeenCalled();
    expect(props.reset).not.toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
