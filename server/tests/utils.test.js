const { isReadyToRun, filterPins, runScan } = require("../utils");
const brokenPins = require('../models/brokenPins'); // schema for pins
const pins = require('../models/pins'); // schema for pins
const nock = require('nock')

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
    const setupMocks = ({
        createdAt,
        broken = [],
        pinId = '123',
        responseStatusCode = 500,
        imgLink = 'https://abc.com/',
        mockHTTPSrequest = true
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
                exec: jest.fn().mockResolvedValueOnce([{
                    _id: pinId,
                    imgLink,
                    imgDescription: 'mock image'
                }])
            })
        );
        if (mockHTTPSrequest) {
            nock(imgLink)
                .get('/')
                .reply(responseStatusCode)
        }
        pins.updateMany = jest.fn().mockImplementation(
            () => ({ exec: jest.fn().mockResolvedValue([{}]) })
        );
        brokenPins.deleteMany = jest.fn().mockImplementationOnce(
            () => ({ exec: jest.fn().mockResolvedValueOnce() })
        );
        brokenPins.create = jest.fn().mockImplementationOnce(
            () => jest.fn().mockResolvedValueOnce()
        );
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

    test('It will run the full scan and update broken images', async () => {
        setupMocks({ createdAt: new Date('01/01/2022').toISOString() })
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        expect(pins.updateMany.mock.calls).toEqual([
            [{ _id: { '$in': [] } }, { isBroken: false }],
            [{
                _id: {
                    '$in': [
                        {
                            statusCode: 500,
                            statusMessage: null,
                            _id: '123',
                            imgLink: 'https://abc.com/',
                            imgDescription: 'mock image'
                        }]
                }
            }, { isBroken: true }]
        ])
        expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
        expect(brokenPins.create).toHaveBeenCalledTimes(1);
        expect(brokenPins.create.mock.calls[0][0]).toStrictEqual({
            broken: [
                {
                    statusCode: 500,
                    statusMessage: null,
                    _id: '123',
                    brokenSince: expect.any(String),
                    imgLink: 'https://abc.com/',
                    imgDescription: 'mock image',
                }
            ]
        })
    })

    test('It will Not run the scan if last run was recent', async () => {
        setupMocks({ createdAt: new Date().toISOString() })
        const scanResult = await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(scanResult).toBe(null);
    })

    test('It will run the full scan but not update broken images', async () => {
        setupMocks({ createdAt: new Date('01/01/2022').toISOString(), responseStatusCode: 200 })
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        expect(pins.updateMany.mock.calls).toEqual([
            [
                {
                    _id: {
                        '$in': [
                            {
                                statusCode: 200,
                                statusMessage: null,
                                _id: '123',
                                imgLink: 'https://abc.com/',
                                imgDescription: 'mock image'
                            }
                        ]
                    }
                },
                { isBroken: false }
            ],
            [{ _id: { '$in': [] } }, { isBroken: true }]
        ])

        expect(brokenPins.deleteMany).not.toHaveBeenCalled();
        expect(brokenPins.create).not.toHaveBeenCalled();
    })

    test('It will run the full scan and update broken images for invalid URL', async () => {
        setupMocks({ createdAt: new Date('01/01/2022').toISOString(), imgLink: 'ABC' })
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        expect(pins.updateMany.mock.calls).toEqual([
            [{ _id: { '$in': [] } }, { isBroken: false }],
            [{
                _id: {
                    '$in': [
                        {
                            statusCode: null,
                            statusMessage: 'Invalid URL',
                            _id: '123',
                            imgLink: 'ABC',
                            imgDescription: 'mock image'
                        }]
                }
            }, { isBroken: true }]
        ])
        expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
        expect(brokenPins.create).toHaveBeenCalledTimes(1);
        expect(brokenPins.create.mock.calls[0][0]).toStrictEqual({
            broken: [
                {
                    statusCode: null,
                    statusMessage: 'Invalid URL',
                    _id: '123',
                    brokenSince: expect.any(String),
                    imgLink: 'ABC',
                    imgDescription: 'mock image',
                }
            ]
        })
    })

    test('It will run the full scan but not update broken images for data protocol URL', async () => {
        setupMocks({ createdAt: new Date('01/01/2022').toISOString(), imgLink: 'data://abc.com/' })
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        expect(pins.updateMany.mock.calls).toEqual([
            [
                {
                    _id: {
                        '$in': [
                            {
                                statusCode: null,
                                statusMessage: 'data protocol',
                                _id: '123',
                                imgLink: 'data://abc.com/',
                                imgDescription: 'mock image'
                            }
                        ]
                    }
                },
                { isBroken: false }
            ],
            [{ _id: { '$in': [] } }, { isBroken: true }]
        ])

        expect(brokenPins.deleteMany).not.toHaveBeenCalled();
        expect(brokenPins.create).not.toHaveBeenCalled();
    })

    test('It will preserve broken image time stamps if not newly found', async () => {
        setupMocks({ createdAt: new Date('01/01/2022').toISOString(), broken: [{ _id: '123', brokenSince: 'over a year ago' }] })
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        expect(pins.updateMany.mock.calls).toEqual([
            [{ _id: { '$in': [] } }, { isBroken: false }],
            [{
                _id: {
                    '$in': [
                        {
                            statusCode: 500,
                            statusMessage: null,
                            _id: '123',
                            imgLink: 'https://abc.com/',
                            imgDescription: 'mock image'
                        }]
                }
            }, { isBroken: true }]
        ])
        expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
        expect(brokenPins.create).toHaveBeenCalledTimes(1);
        expect(brokenPins.create.mock.calls[0][0]).toStrictEqual({
            broken: [
                {
                    statusCode: 500,
                    statusMessage: null,
                    _id: '123',
                    brokenSince: 'over a year ago',
                    imgLink: 'https://abc.com/',
                    imgDescription: 'mock image',
                }
            ]
        })
    })

    test('It will run the full scan and update broken images for error in http response', async () => {
        setupMocks({ createdAt: new Date('01/01/2022').toISOString(), mockHTTPSrequest: false })
        nock('https://abc.com/')
            .get('/')
            .replyWithError('Error in https request');
        await runScan();
        expect(brokenPins.find).toHaveBeenCalledTimes(1);
        expect(pins.find).toHaveBeenCalledTimes(1);
        expect(pins.updateMany).toHaveBeenCalledTimes(2);
        expect(pins.updateMany.mock.calls).toEqual([
            [{ _id: { '$in': [] } }, { isBroken: false }],
            [{
                _id: {
                    '$in': [
                        {
                            statusCode: null,
                            statusMessage: new Error('Error in https request'),
                            _id: '123',
                            imgLink: 'https://abc.com/',
                            imgDescription: 'mock image'
                        }]
                }
            }, { isBroken: true }]
        ])
        expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
        expect(brokenPins.create).toHaveBeenCalledTimes(1);
        expect(brokenPins.create.mock.calls[0][0]).toStrictEqual({
            broken: [
                {
                    statusCode: null,
                    statusMessage: new Error('Error in https request'),
                    _id: '123',
                    brokenSince: expect.any(String),
                    imgLink: 'https://abc.com/',
                    imgDescription: 'mock image',
                }
            ]
        })
    })
})