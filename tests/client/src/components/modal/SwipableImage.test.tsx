/**
 * @jest-environment jsdom
 */
import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import SwipableImage from '../../../../../client/src/components/modal/SwipableImage';
import { pinsStub } from '../../../stub';

const props: React.ComponentProps<typeof SwipableImage> = {
  zoomInfo: {
    pin: pinsStub[0],
    parentDivStyle: {
      top: 10,
      imgWidth: 622.5,
      imgHeight: 500,
      parentWidth: 622.5,
      width: '90%',
      isNoFit: false,
    },
    loadedIndex: 0,
  },
  onSlidePin: jest.fn(),
  onSetImageMetaData: jest.fn(),
};

test('will render', () => {
  const wrapper = shallow(<SwipableImage {...props} />);
  const img:EnzymePropSelector = wrapper.find('ForwardRef(CardMedia)');
  expect(toJson(wrapper)).toMatchSnapshot();
  img.props().onMouseDown({ });
});

test('will handle manual forward and backward clicks', () => {
  const wrapper = shallow(<SwipableImage {...props} />);
  wrapper.props().onMouseOver();
  const listItemBar:EnzymePropSelector = wrapper.find('ForwardRef(ImageListItemBar)');
  const back = listItemBar.props().actionIcon.props.children[0];
  const next = listItemBar.props().actionIcon.props.children[1];
  back.props.onClick();
  back.props.onMouseDown({ preventDefault: jest.fn() });
  next.props.onClick();
  next.props.onMouseDown({ preventDefault: jest.fn() });
  expect(props.onSlidePin).toHaveBeenCalledWith(-1);
  expect(props.onSlidePin).toHaveBeenCalledWith(1);
});
