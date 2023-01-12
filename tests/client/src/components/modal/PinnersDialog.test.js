import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import PinnersDialog from '../../../../../client/src/components/modal/PinnersDialog';
import { pinsStub } from '../../../pinsStub';

test('The pinners dialog will render', () => {
  const wrapper = shallow(<PinnersDialog
    pinnersList={pinsStub[0].savedBy}
    open
    onCloseDialog={jest.fn()}
    onClosePin={jest.fn()}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();
});

test('will close the dialog and the pin on a profile link click', () => {
  const onCloseDialog = jest.fn();
  const onClosePin = jest.fn();
  const wrapper = shallow(<PinnersDialog
    pinnersList={pinsStub[0].savedBy}
    open
    onCloseDialog={onCloseDialog}
    onClosePin={onClosePin}
  />);
  const pinner = wrapper.find('ForwardRef(ListItem)').at(0);
  pinner.props().onClick();
  expect(onCloseDialog).toHaveBeenCalled();
  expect(onClosePin).toHaveBeenCalled();
});
