import React from 'react';
import * as router from 'react-router-dom';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import SearchUsers from '../../../../../client/src/components/profile/SearchUsers';
import RESTcall from '../../../../../client/src/crud';

jest.mock('../../../../../client/src/crud');
const mockedRESTcall = jest.mocked(RESTcall);
jest.useFakeTimers();
// Mock router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useHistory: jest.fn(),
}));

describe('The Search users component', () => {
  let props: React.ComponentProps<typeof SearchUsers>;
  beforeEach(() => {
    props = {
      authenticated: true,
      closeSearch: jest.fn(),
      displayLogin: jest.fn(),
    };
  });

  afterEach(() => {
    mockedRESTcall.mockClear();
  });

  test('will render the component', () => {
    const wrapper = shallow(<SearchUsers {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the input', () => {
    const wrapper = shallow(<SearchUsers {...props} />);
    const autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    const input = autoComplete.props().renderInput({ InputProps: '' });
    const { sx, placeholder } = input.props;
    expect({ sx, placeholder }).toEqual({
      sx: { width: '100%', height: '100%', marginLeft: 1 },
      placeholder: 'Search users...',
    });
  });

  test('will prevent default on enter in input', () => {
    const preventDefault = jest.fn();
    const wrapper = shallow(<SearchUsers {...props} />);
    const autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    const input = autoComplete.props().renderInput({ InputProps: '' });
    input.props.inputProps.onKeyDown({ key: 'Enter', preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });

  test('will render a single option', () => {
    const wrapper = shallow(<SearchUsers {...props} />);
    const autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    const option = autoComplete.props().renderOption(
      { },
      { _id: 'test user Id', service: 'twitter', displayName: 'test displayName' },
    );
    expect(option.props.service).toBe('twitter');
    expect(option.props.profileLinkProps.userId).toBe('test user Id');
    expect(option.props.profileLinkProps.title.props.primary).toBe('test displayName');
  });

  test('will get the option label', () => {
    const wrapper = shallow(<SearchUsers {...props} />);
    const autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    let optionLabel = autoComplete.props().getOptionLabel({ _id: 'test user Id', service: 'twitter', displayName: 'test displayName' });
    expect(optionLabel).toBe('test displayName');
    optionLabel = autoComplete.props().getOptionLabel({ _id: 'test user Id', service: 'twitter' });
    expect(optionLabel).toBe('');
  });

  test('will update the controlled input', () => {
    const wrapper = shallow(<SearchUsers {...props} />);
    let autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    expect(autoComplete.props().inputValue).toBe('');
    autoComplete.props().onInputChange('', 'new value');
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    expect(autoComplete.props().inputValue).toBe('new value');
  });

  test('will make a rest call on keyUp and set the options', async () => {
    const wrapper = shallow(<SearchUsers {...props} />);
    let autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // first change input
    autoComplete.props().onInputChange('', 'search-user');
    // update after input change
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // call keyup
    autoComplete.props().onKeyUp({ key: '' });
    // update again after keyup
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // advance for debounce and resolve crud call
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    // update again after rest call resolves
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    expect(mockedRESTcall).toHaveBeenCalledWith({ address: '/api/searchUser/search-user' });
    expect(autoComplete.props().options).toEqual([
      {
        displayName: 'test_displayName',
        service: 'twitter',
        _id: 'test_user_id',
      },
    ]);
    expect(autoComplete.props().loading).toBe(false);
  });

  test('will not make a rest call on keyUp if search field is empty', async () => {
    const wrapper = shallow(<SearchUsers {...props} />);
    let autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // first change input
    autoComplete.props().onInputChange('', '   ');
    // update after input change
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // call keyup
    autoComplete.props().onKeyUp({ key: '' });
    // update again after keyup
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // advance for debounce
    jest.advanceTimersByTime(1000);
    // update again after rest call resolves
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    expect(mockedRESTcall).toHaveBeenCalledTimes(0);
    expect(autoComplete.props().options).toEqual([]);
    expect(autoComplete.props().loading).toBe(false);
  });

  test('will not make a rest call on ArrowDown of key up', async () => {
    const wrapper = shallow(<SearchUsers {...props} />);
    let autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // first change input
    autoComplete.props().onInputChange('', 'search-user');
    // update after input change
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // call keyup
    autoComplete.props().onKeyUp({ key: 'ArrowDown' });
    // update again after keyup
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // advance for debounce
    jest.advanceTimersByTime(1000);
    // update again after rest call resolves
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    expect(mockedRESTcall).toHaveBeenCalledTimes(0);
    expect(autoComplete.props().options).toEqual([]);
    expect(autoComplete.props().loading).toBe(false);
  });

  test('will not make a rest call on ArrowUp of key up', async () => {
    const wrapper = shallow(<SearchUsers {...props} />);
    let autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // first change input
    autoComplete.props().onInputChange('', 'search-user');
    // update after input change
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // call keyup
    autoComplete.props().onKeyUp({ key: 'ArrowUp' });
    // update again after keyup
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    // advance for debounce
    jest.advanceTimersByTime(1000);
    // update again after rest call resolves
    autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    expect(mockedRESTcall).toHaveBeenCalledTimes(0);
    expect(autoComplete.props().options).toEqual([]);
    expect(autoComplete.props().loading).toBe(false);
  });

  test('will update router history on selection of a user', () => {
    const push = jest.fn();
    const hist = router.useHistory();
    jest
      .spyOn(router, 'useHistory')
      .mockImplementation(() => ({ ...hist, push }));

    const wrapper = shallow(<SearchUsers {...props} />);
    const autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    autoComplete.props().onChange({}, { _id: 'a_user_id' });
    expect(props.closeSearch).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/profile/a_user_id');
  });

  test('will not reroute on create option', () => {
    const push = jest.fn();
    const hist = router.useHistory();
    jest
      .spyOn(router, 'useHistory')
      .mockImplementation(() => ({ ...hist, push }));

    const wrapper = shallow(<SearchUsers {...props} />);
    const autoComplete = wrapper.find({ id: 'free-solo-user-search' });
    autoComplete.props().onChange({}, { _id: 'a_user_id' }, 'createOption');
    expect(props.closeSearch).toHaveBeenCalledTimes(0);
    expect(push).toHaveBeenCalledTimes(0);
  });
});
