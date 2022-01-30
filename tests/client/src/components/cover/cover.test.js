import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Cover from '../../../../../client/src/components/cover/cover';

describe('The landing page', () => {
  test('will display the cover', () => {
    const wrapper = shallow(<Cover />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
