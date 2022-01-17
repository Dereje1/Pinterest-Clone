const { filterPins, runScan } = require("../../server/utils");
const brokenPins = require('../../server/models/brokenPins'); // schema for pins
const pins = require('../../server/models/pins'); // schema for pins
const nock = require('nock')

const goodPinTemplate = {
    _id: '456',
    imgLink: 'https://goodpin.com/',
    imgDescription: 'mock image'
}

const badPinTemplate = {
    _id: '123',
    imgLink: 'https://badpin.com/',
    imgDescription: 'mock image'
}

const stub = {
    updatePinsModel: {
        goodPin: [{
            _id: {
                '$in': [{
                    ...goodPinTemplate,
                    statusCode: 200,
                    statusMessage: null,
                }]
            }
        }, { isBroken: false }],
        brokenPin: [{
            _id: {
                '$in': [{
                    ...badPinTemplate,
                    statusCode: 500,
                    statusMessage: null
                }]
            }
        }, { isBroken: true }],
        brokenPinInvalidURL: [{
            _id: {
                '$in': [{
                    ...badPinTemplate,
                    statusCode: null,
                    statusMessage: 'Invalid URL',
                    imgLink: 'ABC'
                }]
            }
        }, { isBroken: true }],
        goodPinDataProtocol: [{
            _id: {
                '$in': [{
                    ...goodPinTemplate,
                    statusCode: null,
                    statusMessage: 'data protocol',
                    imgLink: 'data://abc.com/',
                }]
            }
        }, { isBroken: false }],
    },
    retrievedPinsModel: {
        allPins: [{ ...badPinTemplate }, { ...goodPinTemplate }],
        oneGoodPin: [{ ...goodPinTemplate }],
        oneBadPin: [{ ...badPinTemplate }],
        badURLPin: [{
            ...badPinTemplate,
            imgLink: 'ABC',
        }],
        dataProtocolPin: [{
            ...goodPinTemplate,
            imgLink: 'data://abc.com/',
        }]
    },
    updateBrokenPinsModel: {
        badResponse: {
            broken: [
                {
                    ...badPinTemplate,
                    statusCode: 500,
                    statusMessage: null,
                    brokenSince: expect.any(String)
                }
            ]
        },
        badURL: {
            broken: [
                {
                    ...badPinTemplate,
                    statusCode: null,
                    statusMessage: 'Invalid URL',
                    brokenSince: expect.any(String),
                    imgLink: 'ABC'
                }
            ]
        },
        keepTimeStamp: {
            broken: [
                {
                    ...badPinTemplate,
                    statusCode: 500,
                    statusMessage: null,
                    brokenSince: 'over a year ago',
                }
            ]
        }
    }
}

describe('filtering pins before returning to client', () => {
    const user = {
        twitter: {
            id: 'twitter test id'
        },
        google: {}
    }
    const rawPinsStub = {
        _id: 'mongoose _id',
        imgDescription: 'description',
        imgLink: 'https://stub',
        owner: { name: 'tester', id: 'any id' },
        savedBy: [{ id: 'any id', name: 'tester' }],
    }
    test('Will filter the pins for the owner', () => {
        const rawPins = [{
            ...rawPinsStub,
            owner: { name: 'tester', id: 'twitter test id' },
        }];
        expect(filterPins(rawPins, user)).toStrictEqual(
            [
                {
                    "_id": "mongoose _id",
                    "hasSaved": false,
                    "imgDescription": "description",
                    "imgLink": "https://stub",
                    "owner": "tester",
                    "owns": true,
                    "savedBy": ['tester']
                }
            ]);
    })

    test('Will filter the pins for the pinner/saver', () => {
        const rawPins = [{
            ...rawPinsStub,
            savedBy: [{ id: 'twitter test id', name: 'tester' }],
        }];
        expect(filterPins(rawPins, user)).toStrictEqual(
            [
                {
                    "_id": "mongoose _id",
                    "hasSaved": true,
                    "imgDescription": "description",
                    "imgLink": "https://stub",
                    "owner": "tester",
                    "owns": false,
                    "savedBy": ['tester']
                }
            ]);
    })

    test('Will filter the pins for anyone not an owner or pinner', () => {
        expect(filterPins([rawPinsStub], user)).toStrictEqual(
            [
                {
                    "_id": "mongoose _id",
                    "hasSaved": false,
                    "imgDescription": "description",
                    "imgLink": "https://stub",
                    "owner": "tester",
                    "owns": false,
                    "savedBy": ['tester']
                }
            ]);
    })
})

describe('running the scan to find broken images', () => {
    const overdueScanDate = new Date('01/16/2022').toISOString()
    const setupMocks = ({
        createdAt = overdueScanDate,
        broken = [],
        mockHTTPSrequest = true,
        pinsReturnType
    }) => {
        brokenPins.find = jest.fn().mockImplementationOnce(
            () => ({
                exec: jest.fn().mockResolvedValueOnce([{
                    createdAt,
                    broken
                }])
            })
        );
        pins.find = jest.fn().mockImplementationOnce(
            () => ({
                exec: jest.fn().mockResolvedValueOnce(stub.retrievedPinsModel[pinsReturnType])
            })
        );
        pins.updateMany = jest.fn().mockImplementation(
            () => ({ exec: jest.fn().mockResolvedValue([{}]) })
        );
        brokenPins.deleteMany = jest.fn().mockImplementationOnce(
            () => ({ exec: jest.fn().mockResolvedValueOnce() })
        );
        brokenPins.create = jest.fn().mockImplementationOnce(
            () => jest.fn().mockResolvedValueOnce()
        );
        if (mockHTTPSrequest) {
            nock('https://badpin.com/')
                .get('/')
                .reply(500)
            nock('https://goodpin.com/')
                .get('/')
                .reply(200)
        }
    }

    afterEach(() => {
        jest.restoreAllMocks();
        nock.cleanAll()
    })


    test('It will Not run the scan if last run was recent', async () => {
        setupMocks({ createdAt: new Date().toISOString() })
        const scanResult = await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(scanResult).toBe(null);
    })

    test('It will run the full scan and update all images', async () => {
        setupMocks({ pinsReturnType: 'allPins' })
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        const [firstCall, secondCall] = pins.updateMany.mock.calls
        expect(firstCall).toEqual(stub.updatePinsModel.goodPin)
        expect(secondCall).toEqual(stub.updatePinsModel.brokenPin)
        expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
        expect(brokenPins.create).toHaveBeenCalledTimes(1);
        expect(brokenPins.create.mock.calls[0][0]).toStrictEqual(stub.updateBrokenPinsModel.badResponse)
    })

    test('It will run the full scan but not update broken images if none found', async () => {
        setupMocks({ pinsReturnType: 'oneGoodPin' })
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        const [firstCall, secondCall] = pins.updateMany.mock.calls
        expect(firstCall).toEqual(stub.updatePinsModel.goodPin)
        expect(secondCall).toEqual([{ _id: { '$in': [] } }, { isBroken: true }])
        expect(brokenPins.deleteMany).not.toHaveBeenCalled();
        expect(brokenPins.create).not.toHaveBeenCalled();
    })

    test('It will run the full scan and update broken images for invalid URLs', async () => {
        setupMocks({ pinsReturnType: 'badURLPin' })
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        const [firstCall, secondCall] = pins.updateMany.mock.calls
        expect(firstCall).toEqual(
            [{ _id: { '$in': [] } }, { isBroken: false }])
        expect(secondCall).toEqual(stub.updatePinsModel.brokenPinInvalidURL)
        expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
        expect(brokenPins.create).toHaveBeenCalledTimes(1);
        expect(brokenPins.create.mock.calls[0][0]).toStrictEqual(stub.updateBrokenPinsModel.badURL)
    })

    test('It will run the full scan but not update broken images for data protocol URL', async () => {
        setupMocks({ pinsReturnType: 'dataProtocolPin' })
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        const [firstCall, secondCall] = pins.updateMany.mock.calls
        expect(firstCall).toEqual(stub.updatePinsModel.goodPinDataProtocol)
        expect(secondCall).toEqual(
            [{ _id: { '$in': [] } }, { isBroken: true }]
        )
        expect(brokenPins.deleteMany).not.toHaveBeenCalled();
        expect(brokenPins.create).not.toHaveBeenCalled();
    })

    test('It will preserve previously broken image time stamps', async () => {
        setupMocks({
            broken: [{
                _id: '123',
                brokenSince: 'over a year ago'
            }],
            pinsReturnType: 'oneBadPin'
        })
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        const [firstCall, secondCall] = pins.updateMany.mock.calls
        expect(firstCall).toEqual(
            [{ _id: { '$in': [] } }, { isBroken: false }],
        )
        expect(secondCall).toEqual(stub.updatePinsModel.brokenPin)
        expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
        expect(brokenPins.create).toHaveBeenCalledTimes(1);
        expect(brokenPins.create.mock.calls[0][0]).toStrictEqual(stub.updateBrokenPinsModel.keepTimeStamp)
    })

    test('It will run the full scan and update broken images for all other error in http response', async () => {
        setupMocks({ mockHTTPSrequest: false, pinsReturnType: 'oneBadPin' })
        nock('https://badpin.com/')
            .get('/')
            .replyWithError('Error in https request');
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        const [firstCall, secondCall] = pins.updateMany.mock.calls
        expect(firstCall).toEqual(
            [{ _id: { '$in': [] } }, { isBroken: false }])
        expect(secondCall).toEqual(
            [{
                _id: {
                    '$in': [
                        {
                            ...badPinTemplate,
                            statusCode: null,
                            statusMessage: new Error('Error in https request')
                        }]
                }
            }, { isBroken: true }]
        )
        expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
        expect(brokenPins.create).toHaveBeenCalledTimes(1);
        expect(brokenPins.create.mock.calls[0][0]).toStrictEqual({
            broken: [
                {
                    ...badPinTemplate,
                    statusCode: null,
                    statusMessage: new Error('Error in https request'),
                    brokenSince: expect.any(String),
                }
            ]
        })
    })
})