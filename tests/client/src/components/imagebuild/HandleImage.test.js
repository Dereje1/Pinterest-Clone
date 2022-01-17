import React from 'react';
import { shallow } from 'enzyme';
import HandleImage from '../../../../../client/src/components/imagebuild/HandleImage';

describe('Handling image action buttons', () => {
    let props;
    beforeEach(() => {
        props = {
            element: {
                hasSaved: false
            },
            pinImage: jest.fn(),
            deletePin: jest.fn(),
        }
    })

    test('will render the save button', () => {
        const wrapper = shallow(<HandleImage {...props} />);
        wrapper.props().onClick();
        expect(wrapper.text()).toBe(' Save')
        expect(props.pinImage).toHaveBeenCalledWith({
            hasSaved: false
        });
    })

    test('will render the delete button', () => {
        const updatedProps = {
            ...props,
            pinImage: null
        }
        const wrapper = shallow(<HandleImage {...updatedProps} />);
        wrapper.props().onClick();
        expect(wrapper.text()).toBe('Delete')
        expect(props.deletePin).toHaveBeenCalledWith({
            hasSaved: false
        });
    })

    test('will not render any action buttons', () => {
        const updatedProps = {
            ...props,
            element: {
                hasSaved: true
            }
        }
        const wrapper = shallow(<HandleImage {...updatedProps} />);
        expect(wrapper.isEmptyRender()).toBe(true);
    })
})
