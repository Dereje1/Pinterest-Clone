'use strict';
const { pinsStub } = require('../tests/client/pinsStub')
module.exports = {
    get: (...args) => {
        const route = args[0];
        if (route === '/auth/profile') {
            return Promise.resolve({
                data: {
                    authenticated: true,
                    userIp: "Tester userIp",
                    username: "Tester username",
                    userId: "Tester userId",
                    displayname: "Tester displayName",
                    service: "twitter"
                }
            });
        } else if (route === '/auth/guest') {
            return Promise.resolve({
                data: {
                    authenticated: false,
                    userIp: "Tester userIp",
                    username: "Tester guest",
                }
            });
        } else {
            return Promise.reject(
                new Error('Auth request rejected')
            );
        }
    }
};