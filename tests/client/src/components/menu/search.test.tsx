/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import * as redux from 'react-redux';
import Search from '../../../../../client/src/components/menu/search';

const mockdispatch = jest.fn();
// Mock redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'), // use actual for all non-hook parts
  useSelector: jest.fn((() => ({ term: null, tagSearch: false }))),
  useDispatch: jest.fn(() => mockdispatch),
}));

jest.useFakeTimers();
describe('The search component', () => {
  let props: React.ComponentProps<typeof Search>;
  beforeEach(() => {
    props = {
      pathname: '/',
      isShowing: false,
      openSearch: jest.fn(),
      closeSearch: jest.fn(),
    };
    global.scrollTo = jest.fn();
  });

  afterEach(() => {
    mockdispatch.mockClear();
  });

  test('Will not render anything if at /pins path', () => {
    const updatedProps = { ...props, pathname: '/pins' };
    const wrapper = shallow(<Search {...updatedProps} />);
    expect(wrapper.isEmptyRender()).toBe(true);
    expect(props.closeSearch).toHaveBeenCalled();
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
    expect(mockdispatch).toHaveBeenCalledWith({
      payload: { tagSearch: false, term: 'abc' },
      type: 'search/updateSearch',
    });
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
    expect(mockdispatch).toHaveBeenNthCalledWith(1, {
      payload: { tagSearch: false, term: 'abc' },
      type: 'search/updateSearch',
    });
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(searchInput.props().value).toBe('abc');
    // second call to clear search terms
    const clearButton = wrapper.find({ id: 'clear-search' });
    clearButton.props().onClick();
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(searchInput.props().value).toBe('');
    expect(mockdispatch).toHaveBeenNthCalledWith(2, {
      payload: { tagSearch: false, term: null },
      type: 'search/updateSearch',
    });
  });

  test('will clear the search in state and the redux store if arrow back is clicked', () => {
    const updatedProps = { ...props, isShowing: true };
    const wrapper = shallow(<Search {...updatedProps} />);
    let searchInput: EnzymePropSelector = wrapper.find('ForwardRef(InputBase)');
    // first call to change search terms
    searchInput.props().onChange({ target: { value: 'abc' } });
    jest.advanceTimersByTime(1000);
    expect(mockdispatch).toHaveBeenNthCalledWith(1, {
      payload: { tagSearch: false, term: 'abc' },
      type: 'search/updateSearch',
    });
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(searchInput.props().value).toBe('abc');
    // second call to clear search terms
    const clearButton = wrapper.find({ id: 'back' });
    clearButton.props().onClick();
    searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(searchInput.props().value).toBe('');
    expect(mockdispatch).toHaveBeenNthCalledWith(2, {
      payload: { tagSearch: false, term: null },
      type: 'search/updateSearch',
    });
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
    const searchInput = wrapper.find('ForwardRef(InputBase)');
    expect(mockdispatch).toHaveBeenCalledWith({
      payload: { tagSearch: false, term: 'tag search' },
      type: 'search/updateSearch',
    });
    expect(props.openSearch).toHaveBeenCalled();
    expect(searchInput.props().value).toBe('tag search');
    expect(global.scrollTo).toHaveBeenCalled();
  });
});
