import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import TagsForm from '../../../../../client/src/components/modal/TagsForm';

describe('The tags form component', () => {
  let props;
  beforeEach(() => {
    props = {
      addTag: jest.fn(),
      closeTagsForm: jest.fn(),
      suggestedTags: ['suggested tag 1', 'suggested tag 2'],
      exisitingTags: ['existing tag 1', 'existing tag 2'],
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
    let autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    expect(autoComplete.props().value).toBe('');
    // trigger value change
    autoComplete.props().onInputChange('', '15 characters..');
    autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    expect(autoComplete.props().value).toBe('15 characters..');
  });

  test('will not update the value for characters > 15', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    expect(autoComplete.props().value).toBe('');
    // trigger value change
    autoComplete.props().onInputChange('', '16 characters..and more');
    autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    expect(autoComplete.props().value).toBe('');
  });

  test('will submit on done if value is present', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    const autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    // // trigger value change
    autoComplete.props().onInputChange('', '15 characters..');
    const done = wrapper.find('Memo(ForwardRef(DoneIcon))');
    // trigger submit
    done.props().onMouseDown({ preventDefault: jest.fn() });
    done.props().onClick();
    expect(props.addTag).toHaveBeenCalledWith('15 CHARACTERS..');
  });

  test('will submit on enter key if value is present', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    // // trigger value change
    autoComplete.props().onInputChange('', '15 characters..');
    // trigger enter
    autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    autoComplete.props().onKeyDown({ key: 'Enter' });
    expect(props.addTag).toHaveBeenCalledWith('15 CHARACTERS..');
  });

  test('will not submit on done if value is empty', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    const autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    // // trigger value change
    autoComplete.props().onInputChange('', '   ');
    const done = wrapper.find('Memo(ForwardRef(DoneIcon))');
    // trigger submit
    done.props().onMouseDown({ preventDefault: jest.fn() });
    done.props().onClick();
    expect(props.addTag).not.toHaveBeenCalled();
  });

  test('will not submit on any other key even if value is present', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    // // trigger value change
    autoComplete.props().onInputChange('', '15 characters..');
    // trigger enter
    autoComplete = wrapper.find('ForwardRef(Autocomplete)');
    autoComplete.props().onKeyDown({ key: 'other key' });
    expect(props.addTag).not.toHaveBeenCalled();
  });
});
