import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import TagsForm from '../../../../../client/src/components/modal/TagsForm';

describe('The tags form component', () => {
  let props;
  beforeEach(() => {
    props = {
      addTag: jest.fn(),
      closeTagsForm: jest.fn(),
      suggestedTags: ['SUGGESTED TAG 1', 'SUGGESTED TAG 2'],
      exisitingTags: ['EXISTING TAG 1', 'EXISTING TAG 2'],
    };
  });

  afterEach(() => {
    props = null;
  });

  test('will render', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will update the value for characters <= 15', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let autoComplete: EnzymePropSelector = wrapper.find('ForwardRef(Autocomplete)');
    expect(autoComplete.props().inputValue).toBe('');
    // trigger value change
    autoComplete.props().onInputChange('', '15 characters..');
    autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    expect(autoComplete.props().inputValue).toBe('15 characters..');
  });

  test('will not update the value for characters > 15', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let autoComplete: EnzymePropSelector = wrapper.find('ForwardRef(Autocomplete)');
    expect(autoComplete.props().inputValue).toBe('');
    // trigger value change
    autoComplete.props().onInputChange('', '16 characters..and more');
    autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    expect(autoComplete.props().inputValue).toBe('');
  });

  test('will submit on done if value is present', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    const autoComplete: EnzymePropSelector = wrapper.find('ForwardRef(Autocomplete)');
    // // trigger value change
    autoComplete.props().onInputChange('', '15 characters..');
    const done: EnzymePropSelector = wrapper.find('Memo(ForwardRef(DoneIcon))');
    // trigger submit
    done.props().onMouseDown({ preventDefault: jest.fn() });
    done.props().onClick();
    expect(props.addTag).toHaveBeenCalledWith('15 CHARACTERS..');
  });

  test('will submit on enter key if value is present', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let autoComplete: EnzymePropSelector = wrapper.find('ForwardRef(Autocomplete)');
    // // trigger value change
    autoComplete.props().onInputChange('', '15 characters..');
    // trigger enter
    autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    autoComplete.props().onKeyDown({ key: 'Enter' });
    expect(props.addTag).toHaveBeenCalledWith('15 CHARACTERS..');
  });

  test('will not submit on done if value is empty', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    const autoComplete: EnzymePropSelector = wrapper.find('ForwardRef(Autocomplete)');
    // // trigger value change
    autoComplete.props().onInputChange('', '   ');
    const done: EnzymePropSelector = wrapper.find('Memo(ForwardRef(DoneIcon))');
    // trigger submit
    done.props().onMouseDown({ preventDefault: jest.fn() });
    done.props().onClick();
    expect(props.addTag).not.toHaveBeenCalled();
  });

  test('will not submit on any other key even if value is present', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let autoComplete: EnzymePropSelector = wrapper.find('ForwardRef(Autocomplete)');
    // // trigger value change
    autoComplete.props().onInputChange('', '15 characters..');
    // trigger enter
    autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    autoComplete.props().onKeyDown({ key: 'other key' });
    expect(props.addTag).not.toHaveBeenCalled();
  });

  test('autocomplete will filter the options present for auto complete', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let autoComplete: EnzymePropSelector = wrapper.find('ForwardRef(Autocomplete)');
    autoComplete.props().onInputChange('', 'sug');
    autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    const filtered = autoComplete.props().filterOptions(['SUGGESTED TAG 1', 'EXISTING TAG 2']);
    expect(filtered).toEqual(['SUGGESTED TAG 1']);
  });

  test('autocomplete will render the text field as input', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    const autoComplete: EnzymePropSelector = wrapper.find('ForwardRef(Autocomplete)');
    const textfield = autoComplete.props().renderInput({});
    expect(textfield.props).toEqual({
      autoFocus: true,
      id: 'Tags_form',
      label: 'Add a Tag',
      type: 'text',
      variant: 'standard',
    });
  });
});
