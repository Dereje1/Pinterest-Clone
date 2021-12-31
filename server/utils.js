/* CRUD utilities */
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

module.exports = { getUserProfile, filterPins }