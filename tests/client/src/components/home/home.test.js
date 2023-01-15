import React from 'react';
import { shallow } from 'enzyme';
import { Home, mapStateToProps } from '../../../../../client/src/components/home/home';
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
      search: { term: null },
    };
  });
  afterEach(() => {
    RESTcall.mockClear();
  });
  test('Shall not render if username has not been populated yet', () => {
    const updatedProps = {
      ...props,
      user: {
        ...props.user,
        username: null,
      },
    };
    const wrapper = shallow(<Home {...updatedProps} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('ImageBuild sub-component shall recieve the pins on CDM as props', async () => {
    const wrapper = shallow(<Home {...props} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    displayedPinList.sort((a, b) => a._id - b._id);
    expect(displayedPinList).toStrictEqual(pinsStub);
    expect(RESTcall).toHaveBeenCalledTimes(1);
    expect(RESTcall).toHaveBeenCalledWith({ address: '/api/home', method: 'get' });
  });

  test('Will filter pins if matching search found for description', async () => {
    const updatedProps = {
      ...props,
      search: { term: 'id-3' },
    };
    const wrapper = shallow(<Home {...updatedProps} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    expect(displayedPinList).toStrictEqual([pinsStub[2]]);
  });

  test('Will filter pins if matching search found for tags', async () => {
    const updatedProps = {
      ...props,
      search: { term: 'tag 2' },
    };
    const wrapper = shallow(<Home {...updatedProps} />);
    await Promise.resolve();
    const imageBuild = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    expect(displayedPinList).toStrictEqual([pinsStub[0]]);
  });

  test('Shall map redux state to component props', () => {
    const mappedProps = mapStateToProps({ reduxState: 'state' });
    expect(mappedProps).toStrictEqual({ reduxState: 'state' });
  });
});
