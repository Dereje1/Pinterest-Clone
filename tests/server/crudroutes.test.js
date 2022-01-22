const { addPin, getPins, pinImage, removePin } = require('../../server/crudroutes')
const pins = require('../../server/models/pins'); // schema for pins

const user = {
    twitter: {
        id: 'twitter test id',
        displayName: 'tester-twitter'
    },
    google: {}
}
const rawPinsStub = [{
    _id: '1',
    imgDescription: 'description-1',
    imgLink: 'https://stub-1',
    owner: { id: 'twitter test id', name: 'tester-twitter' },
    savedBy: [{ id: 'google test id', name: 'tester-google' }],
}, {
    _id: '2',
    imgDescription: 'description-2',
    imgLink: 'https://stub-2',
    owner: { id: 'google test id', name: 'tester-google' },
    savedBy: [{ id: 'twitter test id', name: 'tester-twitter' }],
}, {
    _id: '3',
    imgDescription: 'description-3',
    imgLink: 'https://stub-3',
    owner: { id: 'another test id', name: 'tester-another' },
    savedBy: [{ id: 'another test id', name: 'tester-another' }],
}]

const allPinsResponse = [
    {
        _id: '1',
        imgDescription: 'description-1',
        imgLink: 'https://stub-1',
        owner: 'tester-twitter',
        savedBy: ['tester-google'],
        owns: true,
        hasSaved: false
    },
    {
        _id: '2',
        imgDescription: 'description-2',
        imgLink: 'https://stub-2',
        owner: 'tester-google',
        savedBy: ['tester-twitter'],
        owns: false,
        hasSaved: true
    },
    {
        _id: '3',
        imgDescription: 'description-3',
        imgLink: 'https://stub-3',
        owner: 'tester-another',
        savedBy: ['tester-another'],
        owns: false,
        hasSaved: false
    },
]

const setupMocks = (response = rawPinsStub) => {
    pins.find = jest.fn().mockImplementation(
        () => ({
            exec: jest.fn().mockResolvedValue(response)
        })
    );
    pins.create = jest.fn().mockResolvedValue(response)
    pins.findById = jest.fn().mockImplementation(
        () => ({
            exec: jest.fn().mockResolvedValue(response)
        })
    );

}

describe('Retrieving pins', () => {
    let res;
    const req = {
        query: {
            type: 'all'
        },
        user
    }
    beforeEach(() => {
        res = { json: jest.fn() }
    })
    afterEach(() => {
        jest.restoreAllMocks();
    })

    test('will retrieve all pins for the home page', async () => {
        setupMocks()
        await getPins(req, res)
        expect(pins.find).toHaveBeenCalledTimes(1)
        expect(pins.find).toHaveBeenCalledWith({ isBroken: false })
        expect(res.json).toHaveBeenCalledWith(allPinsResponse)
    });

    test('will retrieve all pins for the profile page', async () => {
        const profilePinsRaw = rawPinsStub.filter(p =>
            p.owner.id === user.twitter.id ||
            p.savedBy.map(s => s.id).includes(user.twitter.id))

        setupMocks(profilePinsRaw)
        req.query.type = 'profile'
        await getPins(req, res)
        expect(pins.find).toHaveBeenCalledTimes(1)
        expect(pins.find).toHaveBeenCalledWith({ $or: [{ 'owner.id': user.twitter.id }, { 'savedBy.id': user.twitter.id }] })
        expect(res.json).toHaveBeenCalledWith(allPinsResponse.filter(p => p.owns || p.hasSaved))
    });

    test('will respond with error if GET is rejected', async () => {
        pins.find = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockRejectedValue(new Error('Mocked rejection'))
            })
        );
        const req = {
            query: {
                type: 'profile'
            },
            user
        }
        await getPins(req, res)
        expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'))
    });
})

describe('Adding a pin', () => {
    let res;
    beforeEach(() => {
        res = { json: jest.fn() }
    })
    afterEach(() => {
        jest.restoreAllMocks();
    })

    test('will create a new pin', async () => {
        const req = {
            user,
            body: {
                owner: {
                    name: 'tester-twitter',
                    service: 'twitter',
                    id: user.twitter.id
                },
                imgDescription: 'description-4',
                imgLink: 'https://stub-4'
            }
        }

        setupMocks({ ...req.body })
        await addPin(req, res)
        expect(pins.create).toHaveBeenCalledTimes(1)
        expect(pins.create).toHaveBeenCalledWith({ ...req.body, isBroken: false })
        expect(res.json).toHaveBeenCalledWith({ ...req.body })
    });

    test('will respond with error if POST is rejected', async () => {
        pins.create = jest.fn().mockRejectedValue(new Error('Mocked rejection'))
        const req = {
            query: {
                type: 'profile'
            },
            user
        }
        await addPin(req, res)
        expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'))
    });
})

describe('Pinning an image', () => {
    let res;
    const req = {
        user,
        body: {
            name: 'tester-twitter',
            service: 'twitter',
            id: user.twitter.id
        },
        params: { _id: 3 }
    }
    beforeEach(() => {
        res = { json: jest.fn(), end: jest.fn() }
    })
    afterEach(() => {
        jest.restoreAllMocks();
    })

    test('will pin an image if user has not pinned', async () => {
        const newSavedBy = [...rawPinsStub[2].savedBy, { id: req.body.id, name: req.body.name }]
        pins.findByIdAndUpdate = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue({ ...rawPinsStub[2], savedBy: newSavedBy })
            })
        );

        setupMocks(rawPinsStub[2])
        await pinImage(req, res)
        expect(pins.findById).toHaveBeenCalledTimes(1)
        expect(pins.findById).toHaveBeenCalledWith(3)
        expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1)
        expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
            3,
            {
                $set:
                {
                    savedBy: [
                        { id: "another test id", name: "tester-another" },
                        { id: "twitter test id", name: "tester-twitter", service: "twitter" }
                    ]
                }
            },
            { new: true })
        expect(res.json).toHaveBeenCalledWith({ ...rawPinsStub[2], savedBy: newSavedBy })
    });

    test('will not pin an image if user has already pinned', async () => {
        const newSavedBy = [...rawPinsStub[2].savedBy, { id: req.body.id, name: req.body.name }]
        setupMocks({ ...rawPinsStub[2], savedBy: newSavedBy })
        await pinImage(req, res)
        expect(pins.findById).toHaveBeenCalledTimes(1)
        expect(pins.findById).toHaveBeenCalledWith(3)
        expect(res.end).toHaveBeenCalledTimes(1)
    });

    test('will respond with error if PUT is rejected', async () => {
        pins.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockRejectedValue(new Error('Mocked rejection'))
            })
        );
        await pinImage(req, res)
        expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'))
    });
})

describe('Deleting/unpinning an image', () => {
    let res;
    const req = {
        user,
        body: {
            name: 'tester-twitter',
            service: 'twitter',
            id: user.twitter.id
        },
        params: { _id: 1 }
    }
    beforeEach(() => {
        res = { json: jest.fn(), end: jest.fn() }
    })
    afterEach(() => {
        jest.restoreAllMocks();
    })

    test('will delete an image if the user is an owner', async () => {
        pins.findOneAndRemove = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(rawPinsStub[0])
            })
        );

        setupMocks(rawPinsStub[0])
        await removePin(req, res)
        expect(pins.findById).toHaveBeenCalledTimes(1)
        expect(pins.findById).toHaveBeenCalledWith(1)
        expect(pins.findOneAndRemove).toHaveBeenCalledTimes(1)
        expect(pins.findOneAndRemove).toHaveBeenCalledWith({ _id: 1 })
        expect(res.json).toHaveBeenCalledWith(rawPinsStub[0])
    });

    test('will unpin an image if user is not an owner', async () => {
        const updatedReq = {...req, params: { _id: 2 }}
        pins.findByIdAndUpdate = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue({ ...rawPinsStub[1], savedBy: [] })
            })
        );

        setupMocks(rawPinsStub[1])
        await removePin(updatedReq, res)
        expect(pins.findById).toHaveBeenCalledTimes(1)
        expect(pins.findById).toHaveBeenCalledWith(2)
        expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1)
        expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
            2,
            {
                $set:
                {
                    savedBy: []
                }
            },
            { new: true })
        expect(res.json).toHaveBeenCalledWith({ ...rawPinsStub[1], savedBy: [] })
    });

    test('will respond with error if DELETE is rejected', async () => {
        pins.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockRejectedValue(new Error('Mocked rejection'))
            })
        );
        await removePin(req, res)
        expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'))
    });
})