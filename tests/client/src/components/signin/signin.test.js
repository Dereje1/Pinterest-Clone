/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { SignIn } from '../../../../../client/src/components/signin/signin';

jest.useFakeTimers();

describe('The sign in component', () => {
  let props;
  const focus = jest.fn();
  beforeEach(() => {
    jest.spyOn(React, 'createRef').mockImplementation(() => ({
      current: {
        focus,
      },
    }));
    props = {
      removeSignin: jest.fn(),
      caller: 'menu',
    };
  });

  afterEach(() => {
    props = null;
    jest.clearAllMocks();
    focus.mockClear();
  });

  test('will render', () => {
    const wrapper = shallow(<SignIn {...props} />);
    expect(focus).toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will reset the guest user', async () => {
    const wrapper = shallow(<SignIn {...props} />);
    wrapper.setState({ show: true });
    const loginButtons = wrapper.find('Connect(LoginButtons)');
    loginButtons.props().guest();
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(wrapper.state().show).toBe(false);
    expect(props.removeSignin).toHaveBeenCalledTimes(1);
  });

  test('will remove component on blur', async () => {
    const wrapper = shallow(<SignIn {...props} />);
    wrapper.setState({ show: true });
    const signInModal = wrapper.find('ForwardRef(Card)');
    signInModal.props().onBlur();
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(wrapper.state().show).toBe(false);
    expect(props.removeSignin).toHaveBeenCalledTimes(1);
  });
});
