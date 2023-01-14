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
    let textField = wrapper.find('ForwardRef(TextField)');
    expect(textField.props().value).toBe('');
    // trigger value change
    textField.props().onChange({ target: { value: '15 characters..' } });
    textField = wrapper.find('ForwardRef(TextField)');
    expect(textField.props().value).toBe('15 characters..');
  });

  test('will not update the value for characters > 15', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let textField = wrapper.find('ForwardRef(TextField)');
    expect(textField.props().value).toBe('');
    // trigger value change
    textField.props().onChange({ target: { value: '16 characters..and more' } });
    textField = wrapper.find('ForwardRef(TextField)');
    expect(textField.props().value).toBe('');
  });

  test('will submit on done if value is present', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    const textField = wrapper.find('ForwardRef(TextField)');
    // // trigger value change
    textField.props().onChange({ target: { value: '15 characters..' } });
    const done = wrapper.find('Memo(ForwardRef(DoneIcon))');
    // trigger submit
    done.props().onMouseDown({ preventDefault: jest.fn() });
    done.props().onClick();
    expect(props.addTag).toHaveBeenCalledWith('15 characters..');
  });

  test('will submit on enter key if value is present', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let textField = wrapper.find('ForwardRef(TextField)');
    // // trigger value change
    textField.props().onChange({ target: { value: '15 characters..' } });
    // trigger enter
    textField = wrapper.find('ForwardRef(TextField)');
    textField.props().onKeyDown({ key: 'Enter' });
    expect(props.addTag).toHaveBeenCalledWith('15 characters..');
  });

  test('will not submit on done if value is empty', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    const textField = wrapper.find('ForwardRef(TextField)');
    // // trigger value change
    textField.props().onChange({ target: { value: '   ' } });
    const done = wrapper.find('Memo(ForwardRef(DoneIcon))');
    // trigger submit
    done.props().onMouseDown({ preventDefault: jest.fn() });
    done.props().onClick();
    expect(props.addTag).not.toHaveBeenCalled();
  });

  test('will not submit on any other key even if value is present', () => {
    const wrapper = shallow(<TagsForm {...props} />);
    let textField = wrapper.find('ForwardRef(TextField)');
    // // trigger value change
    textField.props().onChange({ target: { value: '15 characters..' } });
    // trigger enter
    textField = wrapper.find('ForwardRef(TextField)');
    textField.props().onKeyDown({ key: 'other key' });
    expect(props.addTag).not.toHaveBeenCalled();
  });
});
