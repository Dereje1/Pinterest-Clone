import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import WarningDialog from '../../../../../client/src/components/mypins/WarningDialog';

describe('The Warning Dialog component', () => {
  let props: React.ComponentProps<typeof WarningDialog>;
  beforeEach(() => {
    props = {
      showDialog: true,
      title: 'warning title',
      handleCancel: jest.fn(),
      handleContinue: jest.fn(),
    };
  });

  test('will render...', () => {
    const wrapper = shallow(<WarningDialog {...props} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
