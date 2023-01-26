import { ReactElement } from "react"

export interface Pinner {
    name: string,
    service: string,
    userId: string
}

export interface comment {
    _id: string,
    displayName: string,
    comment: string,
    createdAt: string
}

export interface tag {
    _id: string,
    tag: string,
}

export interface Pin {
    _id: string,
    imgDescription: string,
    imgLink: string,
    owner: { name: string, service: string, userId: string },
    savedBy: Pinner[],
    owns: boolean,
    hasSaved: boolean,
    createdAt: string,
    comments: comment[],
    tags: tag[],
}

export interface providers {
    twitter: boolean,
    google: boolean,
    github: boolean
  }

export interface user {
    authenticated: boolean,
    userIp: string,
    username: string | null,
    displayName: string | null,
    providers: providers
}

export interface search {
    term: string | null,
    tagSearch: boolean
}

export interface providerIcons {
    twitter: {icon: ReactElement, color: string},
    google: {icon: ReactElement, color: string},
    github: {icon: ReactElement, color: string}
  } 