import React from 'react';
import { shallow } from 'enzyme';
import { Home } from '../../../../../client/src/components/home/home';
import RESTcall from '../../../../../client/src/crud';
import { pinsStub } from '../../../pinsStub';

jest.mock('../../../../../client/src/crud');


describe('The Home Component', () => {
  let props;
  beforeEach(() => {
    props = {
      user: {
        authenticated: true,
        displayName: 'tester displayName',
        username: 'tester username',
        service: 'tester service',
        userId: 'tester user Id',
      },
      search: null,
    };
  });
  afterEach(() => {
    RESTcall.mockClear();
  });
  test('Shall not include the sign in component for authenticated users', () => {
    const wrapper = shallow(<Home {...props} />);
    const signIn = wrapper.find('SignIn');
    expect(signIn.length).toBe(0);
  });
  test('Shall include the sign in component for non-authenticated users', () => {
    const wrapper = shallow(<Home {...props} />);
    wrapper.setProps({ user: { authenticated: false } });
    wrapper.setState({ displaySignIn: true });
    const signIn = wrapper.find('SignIn');
    expect(signIn.length).toBe(1);
  });

  test('ImageBuild sub-component shall recieve the pins on CDM as props', async () => {
    const wrapper = shallow(<Home {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    displayedPinList.sort((a, b) => a._id - b._id);
    expect(displayedPinList).toStrictEqual(pinsStub);
    expect(RESTcall).toHaveBeenCalledTimes(1);
    expect(RESTcall).toHaveBeenCalledWith({ address: '/api/?type=All', method: 'get' });
  });

  test('Will filter pins if matching search found', async () => {
    const updatedProps = {
      ...props,
      search: 'id-3',
    };
    const wrapper = shallow(<Home {...updatedProps} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    expect(displayedPinList).toStrictEqual([pinsStub[2]]);
  });
});
