import React from 'react';
import { shallow } from 'enzyme';
import { Home } from '../../../../../client/src/components/home/home'
const { pinsStub } = require('../../../pinsStub')

describe('The Home Component', () => {
    let props;
    beforeEach(() => {
        props = {
            "user": {
                authenticated: true,
                displayname: 'tester displayname',
                username: 'tester username',
                service: 'tester service',
                userID: 'tester user Id'
            },
            "search": null
        }
    })
    test('Shall not include the sign in component for authenticated users', () => {
        const wrapper = shallow(<Home {...props} />);
        const signIn = wrapper.find('SignIn')
        expect(signIn.length).toBe(0)
    })
    test('Shall include the sign in component (hidden) for non-authenticated users', () => {
        const wrapper = shallow(<Home {...props} />);
        wrapper.setProps({ user: { authenticated: false } })
        const signIn = wrapper.find('SignIn')
        expect(signIn.length).toBe(1)
        expect(signIn.props().show).toBe(false)
    })

    test('ImageBuild sub-component shall recieve the pins on CDM as props', async () => {
        const wrapper = shallow(<Home {...props} />);
        await wrapper.instance().componentDidMount()
        const imageBuild = wrapper.find('ImageBuild')
        const displayedPinList = imageBuild.props().pinList;
        displayedPinList.sort((a, b) => a._id - b._id)
        expect(displayedPinList).toStrictEqual(pinsStub)
    })

    test('ImageBuild sub-component will signal that the layout is complete', async () => {
        const wrapper = shallow(<Home {...props} />);
        await wrapper.instance().componentDidMount()
        const imageBuild = wrapper.find('ImageBuild')
        expect(wrapper.state().imagesLoaded).toBe(false)
        imageBuild.props().layoutComplete()
        expect(wrapper.state().imagesLoaded).toBe(true)
    })

    test('ImageBuild sub-component will signal to enalrge the pin', async () => {
        const wrapper = shallow(<Home {...props} />);
        await wrapper.instance().componentDidMount()
        const imageBuild = wrapper.find('ImageBuild')
        const pinEnlargeArgs = [
            {
                target: {
                    type: 'not submit'
                },
                pageY: 10,
                clientY: 5
            },
            {
                ...pinsStub[0]
            }
        ]
        imageBuild.props().pinEnlarge(...pinEnlargeArgs)
        expect(wrapper.state().displayPinZoom).toBe(true)
        expect(wrapper.state().imageInfo[0]).toStrictEqual(pinsStub[0])
        expect(wrapper.state().imageInfo[1].type).toBe('button')
        expect(wrapper.state().imageInfo[2]).toBe(5)
    })

    test('ImageBuild sub-component will signal to pin/save an image', async () => {
        const wrapper = shallow(<Home {...props} />);
        await wrapper.instance().componentDidMount()
        const imageBuild = wrapper.find('ImageBuild')
        let imageToPin = wrapper.state().pinList.filter(p => p._id === pinsStub[0]._id)[0];
        expect(imageToPin.savedBy.includes('tester displayname')).toBe(false)
        imageBuild.props().pinImage(pinsStub[0])
        imageToPin = wrapper.state().pinList.filter(p => p._id === pinsStub[0]._id)[0];
        expect(imageToPin.savedBy.includes('tester displayname')).toBe(true)
        //TODO add assertions / couldn't get axios mock args to work)
    })

    test('ImageBuild sub-component will signal to remove broken images from state', async () => {
        const wrapper = shallow(<Home {...props} />);
        await wrapper.instance().componentDidMount()
        const imageBuild = wrapper.find('ImageBuild')
        let brokenPin = wrapper.state().pinList.some(p => p._id === 1);
        expect(brokenPin).toBe(true)
        imageBuild.props().onBrokenImage(1)
        brokenPin = wrapper.state().pinList.some(p => p._id === 1);
        expect(brokenPin).toBe(false)
    })

    test('Will filter pins if matching search found', async () => {
        const updatedProps = {
            ...props,
            search: 'id-3'
        }
        const wrapper = shallow(<Home {...updatedProps} />);
        await wrapper.instance().componentDidMount()
        const imageBuild = wrapper.find('ImageBuild')
        const displayedPinList = imageBuild.props().pinList;
        expect(displayedPinList).toStrictEqual([pinsStub[2]])
    })

    test('Shall display the sign in component for non-authenticated (guest) users on save', async () => {
        let updatedProps = {
            ...props,
            user: {
                ...props.user,
                authenticated: false,
                username: 'Guest',
            }
        }
        const wrapper = shallow(<Home {...updatedProps} />);
        await wrapper.instance().componentDidMount()
        const imageBuild = wrapper.find('ImageBuild')
        imageBuild.props().pinImage(pinsStub[0])

        const signIn = wrapper.find('SignIn')
        expect(signIn.length).toBe(1)
        expect(signIn.props().show).toBe(true)
        expect(wrapper.state().displayPinZoom).toBe(false)
    })
})