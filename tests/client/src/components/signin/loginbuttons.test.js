/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { LoginButtons } from '../../../../../client/src/components/signin/loginbuttons';

describe('The sign in component', () => {
  let props;
  let mockedAssign;
  beforeEach(() => {
    props = {
      setGuest: jest.fn(),
      guest: jest.fn(),
    };
    const windowSpy = jest.spyOn(global, 'window', 'get');
    mockedAssign = jest.fn();
    windowSpy.mockImplementation(() => ({
      location: {
        assign: mockedAssign,
      },
    }));
  });

  afterEach(() => {
    props = null;
    jest.clearAllMocks();
  });

  test('will render', () => {
    const wrapper = shallow(<LoginButtons {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will handle guest users', () => {
    const wrapper = shallow(<LoginButtons {...props} />);
    const guestButton = wrapper.find({ id: 'guestbutton' });
    guestButton.props().onClick();
    expect(props.setGuest).toHaveBeenCalledWith('/auth/guest');
    expect(props.guest).toHaveBeenCalledTimes(1);
  });

  test('will handle twitter users', () => {
    const wrapper = shallow(<LoginButtons {...props} />);
    const twitterButton = wrapper.find({ id: 'twitterloginbutton' });
    twitterButton.props().onClick();
    expect(mockedAssign).toHaveBeenCalledTimes(1);
    expect(mockedAssign).toHaveBeenCalledWith('/auth/twitter');
  });

  test('will handle google users', () => {
    const wrapper = shallow(<LoginButtons {...props} />);
    const googleButton = wrapper.find({ id: 'googleloginbutton' });
    googleButton.props().onClick();
    expect(mockedAssign).toHaveBeenCalledTimes(1);
    expect(mockedAssign).toHaveBeenCalledWith('/auth/google');
  });
});
