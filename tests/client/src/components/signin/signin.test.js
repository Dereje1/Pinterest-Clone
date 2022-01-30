/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { SignIn } from '../../../../../client/src/components/signin/signin';

describe('The sign in component', () => {
  let props;
  beforeEach(() => {
    props = {
      show: false,
      removeSignin: jest.fn(),
      caller: 'menu',
    };
  });

  afterEach(() => {
    props = null;
    jest.clearAllMocks();
  });

  test('will render', () => {
    const wrapper = shallow(<SignIn {...props} />);
    wrapper.setProps({ ...props, show: true });
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will listen for outclicks after rendering', () => {
    jest.spyOn(window, 'addEventListener').mockImplementationOnce(() => { });
    const wrapper = shallow(<SignIn {...props} />);
    wrapper.setProps({ ...props, show: true });
    expect(wrapper.state().countShow).toBe(1);
    expect(window.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('will reset the guest user', () => {
    jest.spyOn(window, 'removeEventListener').mockImplementationOnce(() => { });
    const wrapper = shallow(<SignIn {...props} />);
    wrapper.setProps({ ...props, show: true });
    const loginButtons = wrapper.find('Connect(LoginButtons)');
    loginButtons.props().guest();
    expect(props.removeSignin).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('will remove component on outclicks if the caller was menu', () => {
    jest.spyOn(window, 'removeEventListener').mockImplementationOnce(() => { });
    const wrapper = shallow(<SignIn {...props} />);
    wrapper.setProps({ ...props, show: true });
    wrapper.instance().listenForOutClicks({ target: { closest: jest.fn(() => false) } });
    expect(props.removeSignin).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('will remove component on outclicks if the caller was home', () => {
    jest.spyOn(window, 'removeEventListener').mockImplementationOnce(() => { });
    const updaatedProps = { ...props, caller: 'home' };
    const wrapper = shallow(<SignIn {...updaatedProps} />);
    wrapper.setProps({ ...updaatedProps, show: true });
    wrapper.instance().listenForOutClicks({ target: { closest: jest.fn(() => false) } });
    expect(props.removeSignin).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('will not remove component on outclicks for any other caller', () => {
    jest.spyOn(window, 'removeEventListener').mockImplementationOnce(() => { });
    const updaatedProps = { ...props, caller: 'anyother' };
    const wrapper = shallow(<SignIn {...updaatedProps} />);
    wrapper.setProps({ ...updaatedProps, show: true });
    wrapper.instance().listenForOutClicks({ target: { closest: jest.fn(() => false) } });
    expect(props.removeSignin).not.toHaveBeenCalled();
    expect(window.removeEventListener).not.toHaveBeenCalled();
  });
});
