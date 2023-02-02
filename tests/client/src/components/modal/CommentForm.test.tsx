import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import CommentForm from '../../../../../client/src/components/modal/CommentForm';

test('will render the form to add comments', () => {
  const wrapper = shallow(
    <CommentForm
      handleClose={jest.fn()}
      handleSubmit={jest.fn()}
    />,
  );
  expect(toJson(wrapper)).toMatchSnapshot();
});

test('will update the comment in state (controlled)', () => {
  const wrapper = shallow(
    <CommentForm
      handleClose={jest.fn()}
      handleSubmit={jest.fn()}
    />,
  );
  let textField: EnzymePropSelector = wrapper.find('ForwardRef(TextField)');
  expect(textField.props().value).toBe('');
  textField.props().onChange({ target: { value: 'new comment' } });
  textField = wrapper.find('ForwardRef(TextField)');
  expect(textField.props().value).toBe('new comment');
});

test('will submit a comment', () => {
  const handleSubmit = jest.fn();
  const wrapper = shallow(
    <CommentForm
      handleClose={jest.fn()}
      handleSubmit={handleSubmit}
    />,
  );
  const textField: EnzymePropSelector = wrapper.find('ForwardRef(TextField)');
  expect(textField.props().value).toBe('');
  textField.props().onChange({ target: { value: 'new comment to submit' } });
  const submit: EnzymePropSelector = wrapper.find('ForwardRef(Button)').at(1);
  submit.props().onClick();
  expect(handleSubmit).toHaveBeenCalledWith('new comment to submit');
});
