import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Loading from '../../../../../client/src/components/imagebuild/Loading';

test('Will render the loading bubbles', () => {
  const wrapper = shallow(<Loading />);
  const bubbles = wrapper.find({ id: 'loadingcontainer' });
  expect(toJson(bubbles)).toMatchSnapshot();
});

test('Will not render the loading bubbles', () => {
  const wrapper = shallow(<Loading ready imagesLoaded />);
  const bubbles = wrapper.find({ id: 'loadingcontainer' });
  expect(toJson(bubbles)).toMatchSnapshot();
});
