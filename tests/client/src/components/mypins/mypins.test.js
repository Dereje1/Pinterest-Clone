/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Mypins } from '../../../../../client/src/components/mypins/mypins';
import RESTcall from '../../../../../client/src/crud';
import { pinsStub } from '../../../pinsStub';

jest.mock('../../../../../client/src/crud');


describe('The Mypins Component', () => {
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
    };
  });
  afterEach(() => {
    props = null;
    RESTcall.mockClear();
  });

  test('Mypins landing page will render', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Mypins landing page will redirect to root if not authenticated', async () => {
    const windowSpy = jest.spyOn(global, 'window', 'get');
    const mockedAssign = jest.fn();
    windowSpy.mockImplementation(() => ({
      location: {
        assign: mockedAssign,
      },
    }));
    props.user.authenticated = false;
    shallow(<Mypins {...props} />);
    await Promise.resolve();
    expect(mockedAssign).toHaveBeenCalledWith('/');
  });

  test('ImageBuild sub-component shall recieve the pins on CDM as props', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    displayedPinList.sort((a, b) => a._id - b._id);
    expect(displayedPinList).toStrictEqual([pinsStub[1], pinsStub[2]]);
    expect(RESTcall).toHaveBeenCalledTimes(1);
    expect(RESTcall).toHaveBeenCalledWith({ address: '/api/?type=profile', method: 'get' });
  });

  test('ImageBuild sub-component will signal that the layout is complete', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    expect(wrapper.state().imagesLoaded).toBe(false);
    imageBuild.props().layoutComplete();
    expect(wrapper.state().imagesLoaded).toBe(true);
    expect(RESTcall).toHaveBeenCalledTimes(1);
    expect(RESTcall).toHaveBeenCalledWith({ address: '/api/?type=profile', method: 'get' });
  });

  test('will not change state if images have already loaded', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    wrapper.setState({ imagesLoaded: true });
    await Promise.resolve();
    const ans = wrapper.instance().layoutComplete();
    expect(ans).toBe(undefined);
  });

  test('ImageBuild sub-component will signal to enalrge the pin', async () => {
    const wrapper = shallow(<Mypins {...props} />);
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
        ...pinsStub[1],
      },
    ];
    imageBuild.props().pinEnlarge(...pinEnlargeArgs);
    expect(wrapper.state().displayPinZoom).toBe(true);
    expect(wrapper.state().imageInfo[0]).toStrictEqual(pinsStub[1]);
    expect(wrapper.state().imageInfo[1].type).toBe('button');
    expect(wrapper.state().imageInfo[2]).toBe(5);
  });

  test('will cancel signal to enalrge the pin', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    const pinEnlargeArgs = [
      {
        target: {
          type: 'submit',
        },
        pageY: 10,
        clientY: 5,
      },
      {
        ...pinsStub[1],
      },
    ];
    imageBuild.props().pinEnlarge(...pinEnlargeArgs);
    expect(wrapper.state().displayPinZoom).toBe(false);
    expect(wrapper.state().imageInfo).toStrictEqual([]);
  });

  test('ImageBuild sub-component will signal to delete/unpin a pin from the db', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    imageBuild.props().deletePin({ _id: 3 });
    expect(wrapper.state().pinList).toStrictEqual([pinsStub[1]]);
    expect(RESTcall).toHaveBeenCalledTimes(2);
    expect(RESTcall.mock.calls).toEqual([
      [{ address: '/api/?type=profile', method: 'get' }],
      [
        {
          address: '/api/3',
          method: 'delete',
        },
      ],
    ]);
  });

  test('ImageBuild sub-component will reset the pin zoom modal', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    wrapper.setState({ displayPinZoom: true });
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    expect(wrapper.state().displayPinZoom).toBe(true);
    imageBuild.props().resetModal();
    expect(wrapper.state().displayPinZoom).toBe(false);
  });

  test('will cancel signal to delete/unpin if pincreate modal is showing', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    wrapper.setState({ displayPinCreate: true });
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    imageBuild.props().deletePin({ _id: 3 });
    expect(wrapper.state().pinList).toStrictEqual([pinsStub[1], pinsStub[2]]);
    expect(RESTcall).toHaveBeenCalledTimes(1);
    expect(RESTcall.mock.calls).toEqual([
      [{ address: '/api/?type=profile', method: 'get' }],
    ]);
  });

  test('ImageBuild sub-component will signal to remove broken images from state', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    const brokenPin = wrapper.state().pinList.some(p => p._id === 2);
    expect(brokenPin).toBe(true);
    imageBuild.props().onBrokenImage(2);
    expect(wrapper.state().pinList[0]).toStrictEqual({
      ...pinsStub[1],
      imgLink: expect.any(Object),
      imgDescription: 'imgDescription id-2 Is Broken',
    });
  });

  test('Will display the form to create a new pin', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    expect(wrapper.state().displayPinCreate).toBe(false);
    const form = wrapper.find({ id: 'creatpinwrapper' });
    form.props().onClick();
    expect(wrapper.state().displayPinCreate).toBe(true);
  });

  test('PinCreate sub-component will signal to add a new pin to the db and state', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    wrapper.setState({ displayPinCreate: true });
    const createPin = wrapper.find('PinCreate');
    createPin.props().savePin({});
    await Promise.resolve();
    expect(wrapper.state().pinList.length).toBe(3);
    expect(wrapper.state().pinList[2]).toStrictEqual({
      savedBy: [],
      owner: 'A new pin by tester',
      imgLink: 'new link',
      imgDescription: 'new description',
      _id: 10,
      owns: true,
      hasSaved: false,
    });
  });

  test('PinCreate sub-component will signal to reset the display of the pin creation modal', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    wrapper.setState({ displayPinCreate: true });
    await Promise.resolve();
    expect(wrapper.state().displayPinCreate).toBe(true);
    const createPin = wrapper.find('PinCreate');
    createPin.props().reset();
    expect(wrapper.state().displayPinCreate).toBe(false);
  });
});
