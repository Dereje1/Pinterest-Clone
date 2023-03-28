import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import UserInfo, { NameChangeForm } from '../../../../../client/src/components/mypins/UserInfo';

describe('The UserInfo component', () => {
  let props: React.ComponentProps<typeof UserInfo>;
  beforeEach(() => {
    props = {
      user: {
        service: 'twitter',
        displayName: 'tester displayName',
        username: 'tester username',
        createdAt: 'tester joined date',
      },
      showNameChangeForm: jest.fn(),
      nameChangeFormIsShowing: false,
      submitNameChange: jest.fn(),
    };
  });

  test('will render with display name', () => {
    const wrapper = shallow(<UserInfo {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    const userName = wrapper.find('ForwardRef(Typography)').at(1);
    expect(userName.text()).toBe('@tester username');
  });

  test('will render with change name form', () => {
    const updatedProps = { ...props, nameChangeFormIsShowing: true };
    const wrapper = shallow(<UserInfo {...updatedProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with username with no @ symbol', () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        service: 'google',
      },
    };
    const wrapper = shallow(<UserInfo {...updatedProps} />);
    const userName = wrapper.find('ForwardRef(Typography)').at(1);
    expect(userName.text()).toBe('tester username');
  });
});

describe('The NameChangeForm component', () => {
  let props: React.ComponentProps<typeof NameChangeForm>;
  beforeEach(() => {
    props = {
      submitNameChange: jest.fn(),
      oldDisplayName: 'tester displayName',
    };
  });

  test('will control the value of the name change', () => {
    const wrapper = shallow(<NameChangeForm {...props} />);
    let textField = wrapper.find('ForwardRef(TextField)');
    expect(textField.props().value).toBe('tester displayName');
    textField.props().onChange?.({ target: { value: 'new value' } } as unknown as React.SyntheticEvent);
    textField = wrapper.find('ForwardRef(TextField)');
    expect(textField.props().value).toBe('new value');
  });

  test('will set an empty string if original display name is null', () => {
    const updatedProps = { ...props, oldDisplayName: null };
    const wrapper = shallow(<NameChangeForm {...updatedProps} />);
    const textField = wrapper.find('ForwardRef(TextField)');
    expect(textField.props().value).toBe('');
  });

  test('will handle a submission of the changed name', () => {
    const wrapper = shallow(<NameChangeForm {...props} />);
    const textField = wrapper.find('ForwardRef(TextField)');
    expect(textField.props().value).toBe('tester displayName');
    textField.props().onChange?.({ target: { value: 'new value' } } as unknown as React.SyntheticEvent);
    const doneIcon = wrapper.find('ForwardRef(IconButton)').at(0);
    doneIcon.props().onClick?.('' as unknown as React.MouseEvent);
    expect(props.submitNameChange).toHaveBeenCalledWith('new value');
  });

  test('will handle a cancellation for the changed name', () => {
    const wrapper = shallow(<NameChangeForm {...props} />);
    const textField = wrapper.find('ForwardRef(TextField)');
    expect(textField.props().value).toBe('tester displayName');
    textField.props().onChange?.({ target: { value: 'new value' } } as unknown as React.SyntheticEvent);
    const cancelIcon = wrapper.find('ForwardRef(IconButton)').at(1);
    cancelIcon.props().onClick?.('' as unknown as React.MouseEvent);
    expect(props.submitNameChange).toHaveBeenCalledWith('');
  });
});
