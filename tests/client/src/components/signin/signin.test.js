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
  beforeEach(() => {
    props = {
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
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will listen for outclicks after rendering', () => {
    jest.spyOn(window, 'addEventListener').mockImplementationOnce(() => { });
    shallow(<SignIn {...props} />);
    expect(window.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('will reset the guest user', async () => {
    jest.spyOn(window, 'removeEventListener').mockImplementationOnce(() => { });
    const wrapper = shallow(<SignIn {...props} />);
    wrapper.setState({ show: true });
    const loginButtons = wrapper.find('Connect(LoginButtons)');
    loginButtons.props().guest();
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(wrapper.state().show).toBe(false);
    expect(props.removeSignin).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('will remove component on outclicks if the caller was menu', async () => {
    jest.spyOn(window, 'removeEventListener').mockImplementationOnce(() => { });
    const wrapper = shallow(<SignIn {...props} />);
    wrapper.setState({ show: true });
    wrapper.instance().listenForOutClicks({ target: { closest: jest.fn(() => false) } });
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(wrapper.state().show).toBe(false);
    expect(props.removeSignin).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('will remove component on outclicks if the caller was home', async () => {
    jest.spyOn(window, 'removeEventListener').mockImplementationOnce(() => { });
    const updaatedProps = { ...props, caller: 'home' };
    const wrapper = shallow(<SignIn {...updaatedProps} />);
    wrapper.setState({ show: true });
    wrapper.instance().listenForOutClicks({ target: { closest: jest.fn(() => false) } });
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(wrapper.state().show).toBe(false);
    expect(props.removeSignin).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  test('will not remove component on outclicks for any other caller', () => {
    jest.spyOn(window, 'removeEventListener').mockImplementationOnce(() => { });
    const updaatedProps = { ...props, caller: 'anyother' };
    const wrapper = shallow(<SignIn {...updaatedProps} />);
    wrapper.instance().listenForOutClicks({ target: { closest: jest.fn(() => false) } });
    expect(wrapper.state().show).toBe(true);
    expect(props.removeSignin).not.toHaveBeenCalled();
    expect(window.removeEventListener).not.toHaveBeenCalled();
  });
});
