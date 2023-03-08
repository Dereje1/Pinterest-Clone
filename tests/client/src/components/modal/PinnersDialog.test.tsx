import React from 'react';
import { EnzymePropSelector, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import PinnersDialog from '../../../../../client/src/components/modal/PinnersDialog';
import { pinsStub } from '../../../stub';

test('The pinners dialog will render', () => {
  const wrapper = shallow(<PinnersDialog
    pinnersList={pinsStub[0].savedBy}
    open
    onCloseDialog={jest.fn()}
    onClosePin={jest.fn()}
    displayLogin={jest.fn()}
    authenticated={false}
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
    displayLogin={jest.fn()}
    authenticated={false}
  />);
  const pinner: EnzymePropSelector = wrapper.find('SingleUserList').at(0);
  pinner.props().profileLinkProps.closePin();
  expect(onCloseDialog).toHaveBeenCalled();
  expect(onClosePin).toHaveBeenCalled();
});
