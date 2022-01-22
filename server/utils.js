const brokenPins = require('./models/brokenPins'); // schema for pins
const pins = require('./models/pins'); // schema for pins
const https = require('https')

/* Isolate auth service used from req.user */
const getUserProfile = (user) => {
    const [service] = ['google', 'twitter'].filter(s => user && Boolean(user[s].id));
    return {
        userId: service && user[service].id,
        displayName: service && user[service].displayName,
        service,
    };
};
/* filterPins return only required pin info to the client */
/*
returns
{
    _id, // send full
    imgDescription, // send full
    imgLink, // send full
    owner: name, // send only display name
    savedBy: modifiedSavedBy, // send only display names of pinners
    owns: // need for displaying action button on pin
    hasSaved: // need for displaying action button on pin
};
*/
const filterPins = (rawPins, user) => rawPins.map((pin) => {
    const {
        _id, imgDescription, imgLink, owner, savedBy,
    } = pin;
    const { userId } = getUserProfile(user);
    const savedIds = savedBy.map(s => s.id);
    const { name } = owner;
    const modifiedSavedBy = savedBy.map(pinner => pinner.name);
    return {
        _id,
        imgDescription,
        imgLink,
        owner: name,
        savedBy: modifiedSavedBy,
        owns: userId ? userId === owner.id : null,
        hasSaved: userId ? savedIds.includes(userId) : null,
    };
});

const isReadyToRun = (lastBackedUp) => {
    const CYCLE_TIME = 6 * 60 * 60 * 1000
    const timeElapsed = new Date() - new Date(lastBackedUp)
    return timeElapsed > CYCLE_TIME
}

const getPrevBrokenTimeStamp = (prevBrokenPins, pinId) => {
    const [prevBrokenPin] = prevBrokenPins.broken.filter(({ _id }) => _id.toString() === pinId.toString())
    if (prevBrokenPin) {
        return prevBrokenPin.brokenSince
    }
    return null;
}

const isValidEnpoint = (originalURL) => new Promise((resolve) => {
    const url = validateURL(originalURL);
    if (url === 'data protocol') resolve({ statusCode: null, statusMessage: 'data protocol', valid: true })
    if (!url) resolve({ statusCode: null, statusMessage: 'Invalid URL', valid: false })

    const inValidStatusMessages = ['Moved Permanently', 'Moved Temporarily']
    const request = https.request(url, (response) => {
        const { statusCode, statusMessage } = response;
        if (statusCode < 400 && !inValidStatusMessages.includes(statusMessage)) {
            resolve({ statusCode, statusMessage, valid: true })
        } else {
            resolve({ statusCode, statusMessage, valid: false })
        }
    })

    request.on('error', (error) => {
        resolve({ statusCode: null, statusMessage: error, valid: false });
    });

    request.end()
})

const validateURL = (string) => {
    try {
        const url = new URL(string);
        if (url.protocol === "data:") return 'data protocol'
        if (url.protocol === "http:" || url.protocol === "https:") return string
    } catch (_) {
        return null;
    }
    return null;
}

module.exports = {
    getUserProfile, filterPins, isReadyToRun, isValidEnpoint, getPrevBrokenTimeStamp
}