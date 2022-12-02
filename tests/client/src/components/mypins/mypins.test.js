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
        displayName: 'tester displayName',
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

  test('Mypins landing page will render nothing if not authenticated', async () => {
    props.user.authenticated = false;
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('Mypins landing page will render bubbles until ready', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    wrapper.setState({ ready: false });
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Mypins landing page will render pins if found', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Mypins landing page will render welcome message if no pins found', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    wrapper.setState({ pinList: [] });
    expect(toJson(wrapper)).toMatchSnapshot();
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

  test('ImageBuild sub-component will show alert to permanently delete a pin if owner', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    imageBuild.props().deletePin({ _id: 3, owns: true, imgDescription: 'deletable' });
    expect(wrapper.state().showDeleteImageModal).toBe(true);
    expect(wrapper.state().deletableImgInfo).toStrictEqual({ _id: 3, imgDescription: 'deletable', owns: true });
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
      imgLink: 's3 new link',
      originalImgLink: 'original new link',
      imgDescription: 'new description',
      _id: 10,
      owns: true,
      hasSaved: false,
      createdAt: '2022-04-09T17:00:33.212Z',
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

  test('Will cancel pin delete on alert', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    wrapper.setState({
      showDeleteImageModal: true,
      deletableImgInfo: {
        _id: 3, owns: true, imgDescription: 'deletable',
      },
      displayPinZoom: false,
    });
    await Promise.resolve();
    const cancelAlert = wrapper.find({ id: 'cancel-delete-alert' });
    cancelAlert.props().onClick();
    expect(wrapper.state().showDeleteImageModal).toBe(false);
    expect(wrapper.state().deletableImgInfo).toBe(null);
  });

  test('Will delete pin on alert', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    wrapper.setState({
      showDeleteImageModal: true,
      deletableImgInfo: {
        _id: 3, owns: true, imgDescription: 'deletable',
      },
      displayPinZoom: false,
    });
    await Promise.resolve();
    const deleteAlert = wrapper.find({ id: 'resume-delete-alert' });
    deleteAlert.props().onClick();
    expect(wrapper.state().showDeleteImageModal).toBe(false);
    expect(wrapper.state().deletableImgInfo).toBe(null);
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
});
