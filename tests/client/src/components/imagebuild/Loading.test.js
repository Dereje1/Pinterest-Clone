import React from 'react';
import { shallow } from 'enzyme';
import Loading from '../../../../../client/src/components/imagebuild/Loading';

test('Will render the loading bubbles', () => {
  const wrapper = shallow(<Loading />);
  const bubbles = wrapper.find({ id: 'bubblecontainer' });
  expect(bubbles.props().style.display).toBe('flex');
});

test('Will not render the loading bubbles', () => {
  const wrapper = shallow(<Loading ready imagesLoaded />);
  const bubbles = wrapper.find({ id: 'bubblecontainer' });
  expect(bubbles.props().style.display).toBe('none');
});
