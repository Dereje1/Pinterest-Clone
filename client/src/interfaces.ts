import { ReactElement } from 'react';

export interface PinnerType {
    name: string,
    service: string,
    userId: string
}

export interface commentType {
    _id: string,
    displayName: string,
    comment: string,
    createdAt: string,
    userId: string
}

export interface tagType {
    _id: string,
    tag: string,
}

export interface PinType {
    _id: string,
    imgDescription: string,
    imgLink: string,
    owner: { name: string, service: string, userId: string },
    savedBy: PinnerType[],
    owns: boolean,
    hasSaved: boolean,
    createdAt: string,
    comments: commentType[],
    tags: tagType[],
}

export interface providersType {
    twitter: boolean,
    google: boolean,
    github: boolean
  }

export interface userType {
    authenticated: boolean,
    userIp: string,
    username: string | null,
    displayName: string | null,
    providers: providersType,
    service: string
}

export interface searchType {
    term: string | null,
    tagSearch: boolean
}

export interface providerIconsType {
    twitter: {icon: ReactElement, color: string},
    google: {icon: ReactElement, color: string},
    github: {icon: ReactElement, color: string}
}
export interface zoomedImageInfoType {
    pin: PinType
    parentDivStyle: {
        imgWidth: string
        parentWidth: number
        isNoFit: boolean
        top: number
        width: string
      }
}
