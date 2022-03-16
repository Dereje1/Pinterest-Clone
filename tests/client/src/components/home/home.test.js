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
        displayname: 'tester displayname',
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

  test('ImageBuild sub-component will signal that the layout is complete and make an extra REST call', async () => {
    const wrapper = shallow(<Home {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    expect(wrapper.state().imagesLoaded).toBe(false);
    imageBuild.props().layoutComplete();
    expect(wrapper.state().imagesLoaded).toBe(true);
    expect(RESTcall).toHaveBeenCalledTimes(1);
    expect(RESTcall.mock.calls).toEqual([[{ address: '/api/?type=All', method: 'get' }]]);
  });

  test('ImageBuild sub-component will signal to enalrge the pin', async () => {
    const wrapper = shallow(<Home {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    const pinEnlargeArgs = [
      {
        target: {
          type: 'not submit',
        },
        pageY: 10,
        clientY: 5,
      },
      {
        ...pinsStub[0],
      },
    ];
    imageBuild.props().pinEnlarge(...pinEnlargeArgs);
    expect(wrapper.state().displayPinZoom).toBe(true);
    expect(wrapper.state().imageInfo[0]).toStrictEqual(pinsStub[0]);
    expect(wrapper.state().imageInfo[1].type).toBe('button');
    expect(wrapper.state().imageInfo[2]).toBe(5);
  });

  test('ImageBuild sub-component will signal to pin/save an image', async () => {
    const wrapper = shallow(<Home {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    let imageToPin = wrapper.state().pinList.filter(p => p._id === pinsStub[0]._id)[0];
    expect(imageToPin.savedBy.includes('tester displayname')).toBe(false);
    imageBuild.props().pinImage(pinsStub[0]);
    [imageToPin] = wrapper.state().pinList.filter(p => p._id === pinsStub[0]._id);
    expect(imageToPin.savedBy.includes('tester displayname')).toBe(true);
    expect(RESTcall).toHaveBeenCalledTimes(2);
    expect(RESTcall.mock.calls).toEqual([
      [{ address: '/api/?type=All', method: 'get' }],
      [
        {
          address: '/api/1',
          method: 'put',
          payload: {
            name: 'tester displayname',
            service: 'tester service',
            id: 'tester user Id',
          },
        },
      ],
    ]);
  });

  test('ImageBuild sub-component will signal to remove broken images from state', async () => {
    const wrapper = shallow(<Home {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    let brokenPin = wrapper.state().pinList.some(p => p._id === 1);
    expect(brokenPin).toBe(true);
    imageBuild.props().onBrokenImage(1);
    brokenPin = wrapper.state().pinList.some(p => p._id === 1);
    expect(brokenPin).toBe(false);
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

  test('Shall display the sign in component for non-authenticated (guest) users on save', async () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        authenticated: false,
        username: 'Guest',
      },
    };
    const wrapper = shallow(<Home {...updatedProps} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    imageBuild.props().pinImage(pinsStub[0]);

    const signIn = wrapper.find('SignIn');
    expect(signIn.length).toBe(1);
    expect(wrapper.state().displayPinZoom).toBe(false);
  });
});
