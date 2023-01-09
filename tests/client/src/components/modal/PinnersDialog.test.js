import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import PinnersDialog from '../../../../../client/src/components/modal/PinnersDialog';
import { pinsStub } from '../../../pinsStub';

test('The pinners dialog will render', () => {
  const wrapper = shallow(<PinnersDialog
    pinnersList={pinsStub[0].savedBy}
    open
    onClose={jest.fn()}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();
});
