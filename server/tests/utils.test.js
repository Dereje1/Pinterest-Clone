const { isReadyToRun, filterPins } = require("../utils");

describe('signaling to run the scan', () => {
    test('Will signal to run the scan', () => {
        const lastBackedUpDate = new Date('01/01/2022').toISOString();
        expect(isReadyToRun(lastBackedUpDate)).toBe(true);
    })

    test('Will signal not to run the scan', () => {
        const lastBackedUpDate = new Date().toISOString();
        expect(isReadyToRun(lastBackedUpDate)).toBe(false);
    })
})

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
