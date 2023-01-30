export interface apiKeys {
    twitterApiKeys: {
        consumerKey: string
        consumerSecret: string
        callbackURL: string
    } | null
    googleApiKeys: {
        clientID: string
        clientSecret: string
        callbackURL: string
    } | null
    githubApiKeys: {
        clientID: string
        clientSecret: string
        callbackURL: string
    } | null
}
export interface services {
    twitter: {
        displayName: string,
        username: string,
        id: string
    }
    google: {
        displayName: string,
        username: string,
        id: string
    }
    github: {
        displayName: string,
        username: string,
        id: string
    }
}

export interface reqUser {
    _doc: services
}

export interface PinnerType {
    name: string,
    service: string,
    id: string
}

export interface commentType {
    _id: string
    displayName: string
    comment: string
    createdAt: string
    userId: string
    service: string
}

export interface tagType {
    _id: string,
    tag: string,
}

export interface PinType {
    _id: string,
    imgDescription: string,
    imgLink: string,
    originalImgLink: string,
    owner: { name: string, service: string, id: string },
    savedBy: PinnerType[],
    createdAt: string,
    comments: commentType[],
    tags: tagType[],
}

export interface genericResponseType {
    json: (res: string | unknown) => void
    end: () => void
}
