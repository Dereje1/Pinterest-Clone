import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import { Home, mapStateToProps } from '../../../../../client/src/components/home/home';
import RESTcall from '../../../../../client/src/crud';
import { pinsStub, reduxStub } from '../../../stub';
import { PinType } from '../../../../../client/src/interfaces';

jest.mock('../../../../../client/src/crud');
const mockedRESTcall = jest.mocked(RESTcall);

describe('The Home Component', () => {
  let props: React.ComponentProps<typeof Home>;
  beforeEach(() => {
    props = {
      user: { ...reduxStub.user },
      search: { term: null, tagSearch: false },
    };
  });
  afterEach(() => {
    mockedRESTcall.mockClear();
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
    const wrapper = shallow<Home>(<Home {...props} />);
    await Promise.resolve();
    const imageBuild: EnzymePropSelector = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    displayedPinList.sort((a: PinType, b: PinType) => Number(a._id) - Number(b._id));
    expect(displayedPinList).toStrictEqual(pinsStub);
    expect(mockedRESTcall).toHaveBeenCalledTimes(1);
    expect(mockedRESTcall).toHaveBeenCalledWith({ address: '/api/home' });
  });

  test('Will filter pins if matching search found for description', async () => {
    const updatedProps = {
      ...props,
      search: { term: 'id-3', tagSearch: false },
    };
    const wrapper = shallow<Home>(<Home {...updatedProps} />);
    await Promise.resolve();
    const imageBuild: EnzymePropSelector = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    expect(displayedPinList).toStrictEqual([pinsStub[2]]);
  });

  test('Will filter pins if matching search found for tags', async () => {
    const updatedProps = {
      ...props,
      search: { term: 'tag 2', tagSearch: false },
    };
    const wrapper = shallow(<Home {...updatedProps} />);
    await Promise.resolve();
    const imageBuild: EnzymePropSelector = wrapper.find('ImageBuild');
    const displayedPinList = imageBuild.props().pinList;
    expect(displayedPinList).toStrictEqual([pinsStub[0]]);
  });

  test('Shall map redux state to component props', () => {
    const mappedProps = mapStateToProps(reduxStub);
    expect(mappedProps).toStrictEqual(reduxStub);
  });
});
