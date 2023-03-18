/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import SwipableImage from '../../../../../client/src/components/modal/SwipableImage';
import { pinsStub } from '../../../stub';

const props: React.ComponentProps<typeof SwipableImage> = {
  zoomInfo: {
    pin: pinsStub[0],
    parentDivStyle: {
      top: 10,
      imgWidth: 622.5,
      parentWidth: 622.5,
      width: '90%',
      isNoFit: false,
    },
    loadedIndex: 0,
  },
  onSwipe: jest.fn(),
};

test('will render', () => {
  const wrapper = shallow(<SwipableImage {...props} />);
  expect(toJson(wrapper)).toMatchSnapshot();
  wrapper.props().onMouseDown({ });
});
