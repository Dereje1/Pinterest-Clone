/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Mypins, mapStateToProps } from '../../../../../client/src/components/mypins/mypins';
import RESTcall from '../../../../../client/src/crud';
import { pinsStub, reduxStub } from '../../../stub';

jest.mock('../../../../../client/src/crud');
const mockedRESTcall = jest.mocked(RESTcall);

describe('The Mypins component', () => {
  let props: React.ComponentProps<typeof Mypins>;
  beforeEach(() => {
    props = {
      user: { ...reduxStub.user },
      updateDisplayName: jest.fn(),
    };
  });
  afterEach(() => {
    mockedRESTcall.mockClear();
  });

  test('landing page will render nothing if not authenticated', async () => {
    props.user.authenticated = false;
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('landing page will render bubbles until ready', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    wrapper.setState({ ready: false });
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('landing page will render pins if found', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('landing page will render message if no pins created found', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    wrapper.setState({ pinList: [] });
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('landing page will render message if no pins saved found', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    wrapper.setState({ pinList: [], displaySetting: 'saved' });
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will cancel signal to delete/unpin if pincreate modal is showing', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    wrapper.setState({ displayPinCreate: true });
    await Promise.resolve();
    const imageBuild: EnzymePropSelector = wrapper.find('ImageBuild');
    imageBuild.props().deletePin({ _id: 3 });
    expect(wrapper.state().pinList).toStrictEqual([pinsStub[1], pinsStub[2]]);
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall.mock.calls).toEqual([
      [{ address: '/api/mypins' }],
    ]);
  });

  test('Will display the form to create a new pin', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    await Promise.resolve();
    expect(wrapper.state().displayPinCreate).toBe(false);
    const form = wrapper.find({ id: 'createpin' });
    form.props().onClick();
    expect(wrapper.state().displayPinCreate).toBe(true);
  });

  test('Will cancel pin delete on alert', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    wrapper.setState({
      showDeleteImageModal: true,
      deletableImgInfo: {
        _id: '3',
        owns: true,
        imgDescription: 'deletable',
        imgLink: '',
        owner: { name: '', service: '', userId: '' },
        savedBy: [],
        hasSaved: false,
        createdAt: '',
        comments: [],
        tags: [],
      },
    });
    await Promise.resolve();
    const cancelAlert = wrapper.find({ id: 'cancel-delete-alert' });
    cancelAlert.props().onClick();
    expect(wrapper.state().showDeleteImageModal).toBe(false);
    expect(wrapper.state().deletableImgInfo).toBe(null);
  });

  test('Will delete pin on alert', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    wrapper.setState({
      showDeleteImageModal: true,
      deletableImgInfo: {
        _id: '3',
        owns: true,
        imgDescription: 'deletable',
        imgLink: '',
        owner: { name: '', service: '', userId: '' },
        savedBy: [],
        hasSaved: false,
        createdAt: '',
        comments: [],
        tags: [],
      },
    });
    await Promise.resolve();
    const deleteAlert = wrapper.find({ id: 'resume-delete-alert' });
    deleteAlert.props().onClick();
    expect(wrapper.state().showDeleteImageModal).toBe(false);
    expect(wrapper.state().deletableImgInfo).toBe(null);
    expect(wrapper.state().pinList).toStrictEqual([pinsStub[1]]);
    expect(mockedRESTcall).toHaveBeenCalledTimes(2);
    expect(mockedRESTcall.mock.calls).toEqual([
      [{ address: '/api/mypins' }],
      [
        {
          address: '/api/3',
          method: 'delete',
        },
      ],
    ]);
  });

  test('will map redux state to the component props', () => {
    const compProps = mapStateToProps(reduxStub);
    expect(compProps).toEqual({ user: reduxStub.user });
  });
});

describe('The ImageBuild subComponent', () => {
  let props: React.ComponentProps<typeof Mypins>;
  beforeEach(() => {
    props = {
      user: { ...reduxStub.user },
      updateDisplayName: jest.fn(),
    };
  });
  afterEach(() => {
    mockedRESTcall.mockClear();
  });

  test('will recieve the pins owned as props', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    const imageBuild: EnzymePropSelector = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    expect(displayedPinList).toStrictEqual([pinsStub[2]]);
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall).toHaveBeenCalledWith({ address: '/api/mypins' });
  });

  test('will recieve the pins saved as props', async () => {
    const wrapper = shallow(<Mypins {...props} />);
    await Promise.resolve();
    const selector: EnzymePropSelector = wrapper.find('UserPinsSelector');
    selector.props().setDisplaySetting('saved');
    const imageBuild: EnzymePropSelector = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    expect(displayedPinList).toStrictEqual([pinsStub[1]]);
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall).toHaveBeenCalledWith({ address: '/api/mypins' });
  });

  test('will signal to unpin a pin from the db', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    await Promise.resolve();
    const imageBuild: EnzymePropSelector = wrapper.find('ImageBuild');
    imageBuild.props().deletePin({ _id: '2' });
    expect(wrapper.state().pinList).toStrictEqual([pinsStub[2]]);
    expect(mockedRESTcall).toHaveBeenCalledTimes(2);
    expect(mockedRESTcall.mock.calls).toEqual([
      [{ address: '/api/mypins' }],
      [
        {
          address: '/api/unpin/2',
          method: 'put',
        },
      ],
    ]);
  });

  test('will signal (with modal) to delete a pin from the db', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    await Promise.resolve();
    const instance = wrapper.instance() as Mypins;
    instance.deletePic({ _id: '3', owns: true });
    expect(wrapper.state().pinList).toStrictEqual([pinsStub[1]]);
    expect(mockedRESTcall).toHaveBeenCalledTimes(2);
    expect(mockedRESTcall.mock.calls).toEqual([
      [{ address: '/api/mypins' }],
      [
        {
          address: '/api/3',
          method: 'delete',
        },
      ],
    ]);
  });

  test('will show alert to permanently delete a pin if owner', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    await Promise.resolve();
    const imageBuild: EnzymePropSelector = wrapper.find('ImageBuild');
    imageBuild.props().deletePin({ _id: 3, owns: true, imgDescription: 'deletable' });
    expect(wrapper.state().showDeleteImageModal).toBe(true);
    expect(wrapper.state().deletableImgInfo).toStrictEqual({ _id: 3, imgDescription: 'deletable', owns: true });
  });
});

describe('The PinCreate sub-component', () => {
  let props: React.ComponentProps<typeof Mypins>;
  beforeEach(() => {
    props = {
      user: { ...reduxStub.user },
      updateDisplayName: jest.fn(),
    };
  });
  afterEach(() => {
    mockedRESTcall.mockClear();
  });

  test('will signal to add a new pin to the db and state', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    await Promise.resolve();
    wrapper.setState({ displayPinCreate: true });
    const createPin: EnzymePropSelector = wrapper.find('PinCreate');
    createPin.props().savePin({});
    await Promise.resolve();
    expect(wrapper.state().pinList.length).toBe(3);
    expect(wrapper.state().pinList[2]).toStrictEqual({
      savedBy: [],
      owner: { name: 'stub displayname', service: 'twitter', userId: 'a stub user id' },
      imgLink: 's3 new link',
      originalImgLink: 'original new link',
      imgDescription: 'new description',
      _id: 10,
      owns: true,
      hasSaved: false,
      createdAt: '2022-04-09T17:00:33.212Z',
      tags: null,
    });
  });

  test('will increment the total AI genrated images by the user', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    await Promise.resolve();
    wrapper.setState({ displayPinCreate: true });
    const createPin: EnzymePropSelector = wrapper.find('PinCreate');
    expect(wrapper.state().totalAiGenratedImages).toBe(2);
    createPin.props().updateGeneratedImages();
    expect(wrapper.state().totalAiGenratedImages).toBe(3);
  });

  test('will signal to reset the display of the pin creation modal', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    wrapper.setState({ displayPinCreate: true });
    await Promise.resolve();
    expect(wrapper.state().displayPinCreate).toBe(true);
    const createPin: EnzymePropSelector = wrapper.find('PinCreate');
    createPin.props().reset();
    expect(wrapper.state().displayPinCreate).toBe(false);
  });
});

describe('The UserInfo sub-component', () => {
  let props: React.ComponentProps<typeof Mypins>;
  beforeEach(() => {
    props = {
      user: { ...reduxStub.user },
      updateDisplayName: jest.fn(),
    };
  });
  afterEach(() => {
    mockedRESTcall.mockClear();
  });

  test('will toggle the name change form on', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    await Promise.resolve();
    expect(wrapper.state().nameChangeFormIsShowing).toBe(false);
    const getUserInfo: EnzymePropSelector = wrapper.find('UserInfo');
    getUserInfo.props().showNameChangeForm();
    expect(wrapper.state().nameChangeFormIsShowing).toBe(true);
  });

  test('will submit a name change', async () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        displayName: 'savedBy - id-2',
      },
    };
    const wrapper = shallow<Mypins>(<Mypins {...updatedProps} />);
    await Promise.resolve();
    const getUserInfo: EnzymePropSelector = wrapper.find('UserInfo');
    getUserInfo.props().submitNameChange('New name');
    await Promise.resolve();
    const [saved, owned] = wrapper.state().pinList;
    expect(mockedRESTcall).toHaveBeenCalledTimes(2);
    expect(mockedRESTcall).toHaveBeenNthCalledWith(2, {
      address: '/api/updateDisplayName',
      method: 'put',
      payload: { newDisplayName: 'New name' },
    });
    expect(owned.owner.name).toBe('New name');
    expect(saved.savedBy[0].name).toBe('New name');
    expect(props.updateDisplayName).toHaveBeenCalledWith('New name');
  });

  test('will not submit a name change if the new name is too long', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    wrapper.setState({ nameChangeFormIsShowing: true });
    await Promise.resolve();
    const getUserInfo: EnzymePropSelector = wrapper.find('UserInfo');
    getUserInfo.props().submitNameChange('New name Is very long');
    await Promise.resolve();
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(wrapper.state().nameChangeFormIsShowing).toBe(false);
  });

  test('will not submit a name change if the new name is empty', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    wrapper.setState({ nameChangeFormIsShowing: true });
    await Promise.resolve();
    const getUserInfo: EnzymePropSelector = wrapper.find('UserInfo');
    getUserInfo.props().submitNameChange('');
    await Promise.resolve();
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(wrapper.state().nameChangeFormIsShowing).toBe(false);
  });

  test('will not submit a name change if the new name has not changed', async () => {
    const wrapper = shallow<Mypins>(<Mypins {...props} />);
    wrapper.setState({ nameChangeFormIsShowing: true });
    await Promise.resolve();
    const getUserInfo: EnzymePropSelector = wrapper.find('UserInfo');
    getUserInfo.props().submitNameChange('tester displayName');
    await Promise.resolve();
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(wrapper.state().nameChangeFormIsShowing).toBe(false);
  });
});
