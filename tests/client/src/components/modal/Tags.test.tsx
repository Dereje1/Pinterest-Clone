import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import * as router from 'react-router-dom';
import Tags, { ListItem } from '../../../../../client/src/components/modal/Tags';
import { pinsStub } from '../../../stub';
import RESTcall from '../../../../../client/src/crud';

jest.mock('../../../../../client/src/crud');
const mockedRESTcall = jest.mocked(RESTcall);

const mockdispatch = jest.fn();
// Mock router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useHistory: jest.fn(),
}));

// Mock redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'), // use actual for all non-hook parts
  useDispatch: jest.fn(() => mockdispatch),
}));

describe('The tags component', () => {
  let props: React.ComponentProps<typeof Tags>;
  beforeEach(() => {
    props = {
      pinInformation: { ...pinsStub[0], owns: true },
      commentFormIsOpen: false,
      updateTags: jest.fn(),
      closePin: jest.fn(),
    };
  });

  test('will render with tags for owner', () => {
    const wrapper = shallow(<Tags {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with tags for non-owner', () => {
    const updatedProps = {
      ...props,
      pinInformation: pinsStub[0],
    };
    const wrapper = shallow(<Tags {...updatedProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render a list item', () => {
    const wrapper = shallow(<ListItem />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will open and close the form to add tags', async () => {
    const wrapper = shallow(<Tags {...props} />);
    const addTags: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    let tagsForm: EnzymePropSelector = wrapper.find('TagsForm');
    expect(tagsForm.isEmptyRender()).toBe(true);
    // trigger form show and test tags fetch
    await addTags.props().onClick();
    tagsForm = wrapper.find('TagsForm');
    expect(tagsForm.isEmptyRender()).toBe(false);
    expect(mockedRESTcall).toHaveBeenCalledWith({
      address: '/api/getTags',
      method: 'get',
      payload: undefined,
    });
    expect(tagsForm.props().suggestedTags).toEqual(['TAG 3', 'TAG 4']);
    // trigger form close
    tagsForm.props().closeTagsForm();
    tagsForm = wrapper.find('TagsForm');
    expect(tagsForm.isEmptyRender()).toBe(true);
  });

  test('will add no suggested tags if rest call is rejected', async () => {
    mockedRESTcall.mockImplementationOnce(() => Promise.reject());
    const wrapper = shallow(<Tags {...props} />);
    const addTags: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    // trigger form show and add tag
    await addTags.props().onClick();
    const tagsForm: EnzymePropSelector = wrapper.find('TagsForm');
    expect(tagsForm.isEmptyRender()).toBe(false);
    expect(mockedRESTcall).toHaveBeenCalledWith({
      address: '/api/getTags',
      method: 'get',
      payload: undefined,
    });
    expect(tagsForm.props().suggestedTags).toEqual([]);
  });

  test('will add a tag', () => {
    const wrapper = shallow(<Tags {...props} />);
    const addTags: EnzymePropSelector = wrapper.find('ForwardRef(IconButton)');
    // trigger form show and add tag
    addTags.props().onClick();
    const tagsForm: EnzymePropSelector = wrapper.find('TagsForm');
    tagsForm.props().addTag('a new tag');
    expect(props.updateTags).toHaveBeenCalledWith('?pinID=1&tag=a new tag');
  });

  test('will delete a tag', () => {
    const wrapper = shallow(<Tags {...props} />);
    const chip = wrapper.find({ label: 'TAG 1' });
    // trigger delete tag
    chip.props().onDelete();
    expect(props.updateTags).toHaveBeenCalledWith('?pinID=1&deleteId=tag_id_1');
  });

  test('will search on tag click', () => {
    const push = jest.fn();
    const hist = router.useHistory();
    jest
      .spyOn(router, 'useHistory')
      .mockImplementation(() => ({ ...hist, push }));

    const wrapper = shallow(<Tags {...props} />);
    const chip = wrapper.find({ label: 'TAG 1' });
    chip.props().onClick();
    expect(mockdispatch).toHaveBeenCalledWith({
      type: 'UPDATE_SEARCH',
      payload: {
        tagSearch: true,
        term: 'tag 1',
      },
    });
    expect(props.closePin).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/');
  });
});
