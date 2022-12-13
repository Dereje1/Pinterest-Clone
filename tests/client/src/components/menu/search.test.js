import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Search from '../../../../../client/src/components/menu/search';

jest.useFakeTimers();
describe('The search component', () => {
  let props;
  beforeEach(() => {
    props = {
      searchUpdate: jest.fn(),
      pathname: '/',
      isShowing: false,
      openSearch: jest.fn(),
      closeSearch: jest.fn(),
    };
  });

  afterEach(() => {
    props = null;
  });

  test('Will not render anything if not at root path', () => {
    const updatedProps = { ...props, pathname: '/anotherpath' };
    const wrapper = shallow(<Search {...updatedProps} />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  test('Will render only search Icon if not selected by the user', () => {
    const wrapper = shallow(<Search {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('Will render search bar if selected by the user', () => {
    const updatedProps = { ...props, isShowing: true };
    const wrapper = shallow(<Search {...updatedProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will update the search in state and the redux store on change', () => {
    const updatedProps = { ...props, isShowing: true };
    const wrapper = shallow(<Search {...updatedProps} />);
    let searchInput = wrapper.find('ForwardRef(InputBase)');
    searchInput.props().onChange({ target: { value: 'abc' } });
    jest.advanceTimersByTime(1000);
    expect(props.searchUpdate).toHaveBeenCalledWith('abc');
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(searchInput.props().value).toBe('abc');
  });
  test('will clear the search in state and the redux store on click', () => {
    const updatedProps = { ...props, isShowing: true };
    const wrapper = shallow(<Search {...updatedProps} />);
    let searchInput = wrapper.find('ForwardRef(InputBase)');
    // first call to change search terms
    searchInput.props().onChange({ target: { value: 'abc' } });
    jest.advanceTimersByTime(1000);
    expect(props.searchUpdate).toHaveBeenNthCalledWith(1, 'abc');
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(searchInput.props().value).toBe('abc');
    // second call to clear search terms
    const clearButton = wrapper.find({ id: 'clear-search' });
    clearButton.props().onClick();
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(searchInput.props().value).toBe('');
    expect(props.searchUpdate).toHaveBeenNthCalledWith(2, '');
  });

  test('will clear the search in state and the redux store if arrow back is clicked', () => {
    const updatedProps = { ...props, isShowing: true };
    const wrapper = shallow(<Search {...updatedProps} />);
    let searchInput = wrapper.find('ForwardRef(InputBase)');
    // first call to change search terms
    searchInput.props().onChange({ target: { value: 'abc' } });
    jest.advanceTimersByTime(1000);
    expect(props.searchUpdate).toHaveBeenNthCalledWith(1, 'abc');
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(searchInput.props().value).toBe('abc');
    // second call to clear search terms
    const clearButton = wrapper.find({ id: 'back' });
    clearButton.props().onClick();
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(searchInput.props().value).toBe('');
    expect(props.searchUpdate).toHaveBeenNthCalledWith(2, '');
  });
});
