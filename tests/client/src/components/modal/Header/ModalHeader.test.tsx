import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ModalHeader, { StyledBadge } from '../../../../../../client/src/components/modal/Header/ModalHeader';
import { pinsStub } from '../../../../stub';

describe('The Modal Header', () => {
  let props: React.ComponentProps<typeof ModalHeader>;
  beforeEach(() => {
    props = {
      authenticated: true,
      commentsShowing: false,
      pinInformation: pinsStub[0],
      toggleComments: jest.fn(),
      closePin: jest.fn(),
      displayLogin: jest.fn(),
      deletePin: jest.fn(),
      pinImage: jest.fn(),
    };
  });

  test('will render', () => {
    const wrapper = shallow(<ModalHeader {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('will render the correct comment Icon if comments are showing', () => {
    const updatedProps = {
      ...props,
      commentsShowing: true,
    };
    const wrapper = shallow(<ModalHeader {...updatedProps} />);
    let commentIcon: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    commentIcon = commentIcon.props().action.props.children[0].props.children.props;
    expect(commentIcon.children.type.type.render.displayName).toBe('CommentIcon');
  });

  test('will toggle the comments window', () => {
    const wrapper = shallow(<ModalHeader {...props} />);
    // toggle comment on
    let commentIcon: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    commentIcon = commentIcon.props().action.props.children[0].props.children.props;
    commentIcon.onClick();
    commentIcon.onMouseDown({ preventDefault: jest.fn() });
    expect(props.toggleComments).toHaveBeenCalled();
  });

  test('will set zero on badge content for pins icon if savedby is empty', () => {
    const updatedProps = {
      ...props,
      pinInformation: {
        ...pinsStub[0],
        savedBy: [],
      },
    };
    const wrapper = shallow(<ModalHeader {...updatedProps} />);
    // toggle comment on
    let pinsIcon: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    pinsIcon = pinsIcon
      .props()
      .action
      .props
      .children[1]
      .props;
    expect(pinsIcon.badgeContent).toBe(0);
  });

  test('will include a link to the profile of the owner in the subheader and close modal on click', async () => {
    const wrapper = shallow(<ModalHeader {...props} />);
    const cardHeader: EnzymePropSelector = wrapper.find('ForwardRef(CardHeader)');
    const link = cardHeader.props().subheader.props.children[0].props;
    link.closePin();
    expect(link.userId).toBe('1');
    expect(props.closePin).toHaveBeenCalledTimes(1);
  });
});

describe('The styled badge', () => {
  test('Will render for pins', () => {
    const badge = shallow(<StyledBadge name="pin" />);
    expect(toJson(badge)).toMatchSnapshot();
  });

  test('Will render for comments', () => {
    const badge = shallow(<StyledBadge name="comments" />);
    expect(toJson(badge)).toMatchSnapshot();
  });
});
