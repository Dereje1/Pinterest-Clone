/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import * as redux from 'react-redux';
import Search from '../../../../../client/src/components/menu/search';

// Mock redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'), // use actual for all non-hook parts
  useSelector: jest.fn((() => ({ term: null, tagSearch: false }))),
}));

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
    global.scrollTo = jest.fn();
  });

  afterEach(() => {
    props = null;
  });

  test('Will not render anything if at /pins path', () => {
    const updatedProps = { ...props, pathname: '/pins' };
    const wrapper = shallow(<Search {...updatedProps} />);
    expect(wrapper.isEmptyRender()).toBe(true);
    expect(props.closeSearch).toHaveBeenCalled();
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
    let searchInput: EnzymePropSelector = wrapper.find('ForwardRef(InputBase)');
    searchInput.props().onChange({ target: { value: 'abc' } });
    jest.advanceTimersByTime(1000);
    expect(props.searchUpdate).toHaveBeenCalledWith('abc');
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(searchInput.props().value).toBe('abc');
  });
  test('will clear the search in state and the redux store on click', () => {
    const updatedProps = { ...props, isShowing: true };
    const wrapper = shallow(<Search {...updatedProps} />);
    let searchInput: EnzymePropSelector = wrapper.find('ForwardRef(InputBase)');
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
    let searchInput: EnzymePropSelector = wrapper.find('ForwardRef(InputBase)');
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

  test('Will keep search open with prev value if user comes back to home', () => {
    // start with root path and update search val
    const updatedProps = { ...props, isShowing: true };
    const wrapper = shallow(<Search {...updatedProps} />);
    // update search val
    let searchInput: EnzymePropSelector = wrapper.find('ForwardRef(InputBase)');
    searchInput.props().onChange({ target: { value: 'abc' } });
    expect(wrapper.isEmptyRender()).toBe(false);
    // go back to a non searchable path
    wrapper.setProps({ ...props, pathname: '/pins' });
    expect(wrapper.isEmptyRender()).toBe(true);
    expect(props.closeSearch).toHaveBeenCalled();
    // then go back to root path again
    wrapper.setProps({ ...props, pathname: '/', isShowing: true });
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(props.openSearch).toHaveBeenCalled();
    expect(searchInput.props().value).toBe('abc');
  });

  test('will use the tag terms to search if change in redux store', () => {
    jest
      .spyOn(redux, 'useSelector')
      .mockImplementationOnce(() => ({ term: 'tag search', tagSearch: true }));
    const wrapper = shallow(<Search {...props} isShowing />);
    jest.advanceTimersByTime(1000);
    const searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(props.searchUpdate).toHaveBeenCalledWith('tag search');
    expect(props.openSearch).toHaveBeenCalled();
    expect(searchInput.props().value).toBe('tag search');
    expect(global.scrollTo).toHaveBeenCalled();
  });
});
