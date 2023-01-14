import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Tags, { ListItem } from '../../../../../client/src/components/modal/Tags';
import { pinsStub } from '../../../pinsStub';

describe('The tags component', () => {
  let props;
  beforeEach(() => {
    props = {
      pinInformation: { ...pinsStub[0], owns: true },
      commentFormIsOpen: false,
      updateTags: jest.fn(),
    };
  });

  afterEach(() => {
    props = null;
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

  test('will open and close the form to add tags', () => {
    const wrapper = shallow(<Tags {...props} />);
    const addTags = wrapper.find('ForwardRef(IconButton)');
    let tagsForm = wrapper.find('TagsForm');
    expect(tagsForm.isEmptyRender()).toBe(true);
    // trigger form show
    addTags.props().onClick();
    tagsForm = wrapper.find('TagsForm');
    expect(tagsForm.isEmptyRender()).toBe(false);
    // trigger form close
    tagsForm.props().closeTagsForm();
    tagsForm = wrapper.find('TagsForm');
    expect(tagsForm.isEmptyRender()).toBe(true);
  });

  test('will add a tag', () => {
    const wrapper = shallow(<Tags {...props} />);
    const addTags = wrapper.find('ForwardRef(IconButton)');
    // trigger form show and add tag
    addTags.props().onClick();
    const tagsForm = wrapper.find('TagsForm');
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
});
