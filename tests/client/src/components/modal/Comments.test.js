import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Comments from '../../../../../client/src/components/modal/Comments';
import { pinsStub } from '../../../pinsStub';

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
    const fabButton = wrapper.find('ForwardRef(Fab)');
    let commentForm = wrapper.find('CommentForm');
    // assert closed -> open
    expect(commentForm.props().open).toBe(false);
    fabButton.props().onClick();
    fabButton.props().onMouseDown({ preventDefault: jest.fn() });
    commentForm = wrapper.find('CommentForm');
    expect(commentForm.props().open).toBe(true);
    // assert open -> closed
    commentForm.props().handleClose();
    commentForm = wrapper.find('CommentForm');
    expect(commentForm.props().open).toBe(false);
  });

  test('will not close the comment form on a backdrop click', () => {
    const wrapper = shallow(<Comments {...props} />);
    const fabButton = wrapper.find('ForwardRef(Fab)');
    let commentForm = wrapper.find('CommentForm');
    // assert open
    fabButton.props().onClick();
    fabButton.props().onMouseDown({ preventDefault: jest.fn() });
    commentForm = wrapper.find('CommentForm');
    expect(commentForm.props().open).toBe(true);
    // assert still open
    commentForm.props().handleClose('', 'backdropClick');
    commentForm = wrapper.find('CommentForm');
    expect(commentForm.props().open).toBe(true);
  });

  test('will submit a comment', () => {
    const wrapper = shallow(<Comments {...props} />);
    const commentForm = wrapper.find('CommentForm');
    commentForm.props().handleSubmit('a new comment');
    expect(props.handleNewComment).toHaveBeenCalledWith('a new comment');
  });

  test('will open and close the pinners dialog', () => {
    const wrapper = shallow(<Comments {...props} />);
    const pinnersButton = wrapper.find('ForwardRef(Button)');
    let pinnersDialog = wrapper.find('PinnersDialog');
    // assert closed -> open
    expect(pinnersDialog.props().open).toBe(false);
    pinnersButton.props().onClick();
    pinnersDialog = wrapper.find('PinnersDialog');
    expect(pinnersDialog.props().open).toBe(true);
    // assert open -> closed
    pinnersDialog.props().onClose();
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
    thumbnailDiv.props().onKeyDown();
    expect(props.toggleComments).toHaveBeenCalled();
  });
});
