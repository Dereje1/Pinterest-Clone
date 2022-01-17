'use strict';
const { pinsStub } = require('../tests/client/pinsStub')
module.exports = {
    get: () => {
        return Promise.resolve({
            data: [...pinsStub]
        });
    },
    put: (...args) => {
        return Promise.resolve({
            data: [{args}]
        });
    },
};