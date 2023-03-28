/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { LoginButtons, mapStateToProps, ProviderButton } from '../../../../../client/src/components/signin/loginbuttons';
import { reduxStub } from '../../../stub';

describe('The sign in component', () => {
  let props: React.ComponentProps<typeof LoginButtons>;
  beforeEach(() => {
    props = {
      setGuest: jest.fn(),
      guest: jest.fn(),
      user: { ...reduxStub.user },
    };
  });

  afterEach(() => {
    // props = null;
    jest.clearAllMocks();
  });

  test('will render for cover page', () => {
    const wrapper = shallow(<LoginButtons {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render for Guest users on homepage', () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        username: 'Guest',
      },
    };
    const wrapper = shallow(<LoginButtons {...updatedProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render only available providers', () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        providers: {
          twitter: false,
          google: false,
          github: true,
        },
      },
    };
    const wrapper = shallow(<LoginButtons {...updatedProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will not render if no provider info', () => {
    const updatedProps = {
      ...props,
      user: {
        authenticated: true,
        userId: 'a stub user id',
        userIp: 'stub Ip',
        username: 'stub username',
        displayName: 'stub displayname',
        service: 'twitter',
        createdAt: 'stub join date',
      },
    };
    const wrapper = shallow(<LoginButtons {...updatedProps} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('will handle guest users if on cover page', () => {
    const wrapper = shallow(<LoginButtons {...props} />);
    const guestButton = wrapper.find({ id: 'guestbutton' });
    guestButton.props().onClick();
    expect(props.setGuest).toHaveBeenCalledWith('/auth/guest');
    expect(props.guest).toHaveBeenCalledTimes(1);
  });

  test('will map redux user state to props', () => {
    const reduxProps = mapStateToProps(reduxStub);
    expect(reduxProps).toEqual({ user: reduxStub.user });
  });
});

describe('Provider buttons', () => {
  let mockedAssign: jest.Mock;
  let preventDefault: jest.Mock;
  beforeEach(() => {
    const windowSpy = jest.spyOn(window, 'location', 'get');
    mockedAssign = jest.fn();
    preventDefault = jest.fn();
    windowSpy.mockReturnValue({
      ...window.location,
      assign: mockedAssign,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    preventDefault.mockClear();
  });

  test('will handle twitter users', () => {
    const wrapper = shallow(<ProviderButton service="twitter" />);
    const twitterButton = wrapper.find({ id: 'twitterloginbutton' });
    twitterButton.props().onClick();
    twitterButton.props().onMouseDown({ preventDefault });
    expect(mockedAssign).toHaveBeenCalledTimes(1);
    expect(mockedAssign).toHaveBeenCalledWith('/auth/twitter');
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('will handle google users', () => {
    const wrapper = shallow(<ProviderButton service="google" />);
    const googleButton = wrapper.find({ id: 'googleloginbutton' });
    googleButton.props().onClick();
    googleButton.props().onMouseDown({ preventDefault });
    expect(mockedAssign).toHaveBeenCalledTimes(1);
    expect(mockedAssign).toHaveBeenCalledWith('/auth/google');
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('will handle github users', () => {
    const wrapper = shallow(<ProviderButton service="github" />);
    const githubButton = wrapper.find({ id: 'githubloginbutton' });
    githubButton.props().onClick();
    githubButton.props().onMouseDown({ preventDefault });
    expect(mockedAssign).toHaveBeenCalledTimes(1);
    expect(mockedAssign).toHaveBeenCalledWith('/auth/github');
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
