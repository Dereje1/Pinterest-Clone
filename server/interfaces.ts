import { UserType } from './models/user';

export interface PinnerType {
    name: string,
    service: string,
    id: string
}

export interface commentType {
    _id: string
    user: UserType
    comment: string
    createdAt: string
}

export interface tagType {
    _id: string,
    tag: string,
}

export interface PopulatedPinType {
    _id: string,
    imgDescription: string,
    imgLink: string,
    originalImgLink: string,
    owner: UserType,
    savedBy: UserType[],
    createdAt: string,
    comments: commentType[],
    tags: tagType[],
    AIgeneratedId: string | null
}

export interface genericResponseType {
    json: (res: string | unknown) => void
    end: () => void
    redirect: (route: string) => void
}
