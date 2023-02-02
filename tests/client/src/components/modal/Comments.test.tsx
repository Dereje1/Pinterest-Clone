import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Comments from '../../../../../client/src/components/modal/Comments';
import { pinsStub } from '../../../stub';

describe('The comments window', () => {
  let props;
  beforeEach(() => {
    props = {
      stylingProps: { width: 20, height: 30 },
      pinInformation: pinsStub[0],
      handleNewComment: jest.fn(),
      authenticated: true,
      toggleComments: jest.fn(),
      closePin: jest.fn(),
      updateTags: jest.fn(),
    };
  });

  afterEach(() => {
    props = null;
  });

  test('will render with comments', () => {
    const wrapper = shallow(<Comments {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with no comments for authenticated users', () => {
    const updatedProps = { ...props, pinInformation: pinsStub[1] };
    const wrapper = shallow(<Comments {...updatedProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render with no comments for unauthenticated users', () => {
    const updatedProps = { ...props, pinInformation: pinsStub[1], authenticated: false };
    const wrapper = shallow(<Comments {...updatedProps} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will open and close the comment form', () => {
    const wrapper = shallow(<Comments {...props} />);
    let fabButton: EnzymePropSelector = wrapper.find({ 'aria-label': 'add' });
    let commentForm: EnzymePropSelector = wrapper.find('CommentForm');
    // assert closed -> open
    expect(commentForm.isEmptyRender()).toBe(true);
    fabButton.props().onClick();
    commentForm = wrapper.find('CommentForm');
    fabButton = wrapper.find({ 'aria-label': 'add' });
    expect(commentForm.isEmptyRender()).toBe(false);
    expect(fabButton.props().disabled).toBe(true);
    // assert open -> closed
    commentForm.props().handleClose();
    commentForm = wrapper.find('CommentForm');
    expect(commentForm.isEmptyRender()).toBe(true);
  });

  test('will submit a comment', () => {
    const wrapper = shallow(<Comments {...props} />);
    const fabButton: EnzymePropSelector = wrapper.find({ 'aria-label': 'add' });
    fabButton.props().onClick();
    const commentForm: EnzymePropSelector = wrapper.find('CommentForm');
    commentForm.props().handleSubmit('a new comment');
    expect(props.handleNewComment).toHaveBeenCalledWith('a new comment');
  });

  test('will not submit a comment if empty', () => {
    const wrapper = shallow(<Comments {...props} />);
    const fabButton: EnzymePropSelector = wrapper.find({ 'aria-label': 'add' });
    fabButton.props().onClick();
    const commentForm: EnzymePropSelector = wrapper.find('CommentForm');
    commentForm.props().handleSubmit('      ');
    expect(props.handleNewComment).not.toHaveBeenCalled();
  });

  test('will open and close the pinners dialog', () => {
    const wrapper = shallow(<Comments {...props} />);
    const pinnersButton: EnzymePropSelector = wrapper.find({ 'aria-label': 'pinners' });
    let pinnersDialog: EnzymePropSelector = wrapper.find('PinnersDialog');
    // assert closed -> open
    expect(pinnersDialog.props().open).toBe(false);
    pinnersButton.props().onClick();
    pinnersDialog = wrapper.find('PinnersDialog');
    expect(pinnersDialog.props().open).toBe(true);
    // assert open -> closed
    pinnersDialog.props().onCloseDialog();
    pinnersDialog = wrapper.find('PinnersDialog');
    expect(pinnersDialog.props().open).toBe(false);
  });

  test('will not render pinners button if pin has no pinners', () => {
    const updatedProps = {
      ...props,
      pinInformation: {
        ...props.pinInformation,
        savedBy: [],
      },
    };
    const wrapper = shallow(<Comments {...updatedProps} />);
    const pinnersButton = wrapper.find('ForwardRef(Button)');
    expect(pinnersButton.isEmptyRender()).toBe(true);
  });

  test('will toggle the comments window on thumbnail img click', () => {
    const wrapper = shallow(<Comments {...props} />);
    const thumbnailDiv = wrapper.find({ id: 'thumbnail' });
    thumbnailDiv.props().onClick();
    expect(props.toggleComments).toHaveBeenCalled();
  });
});
