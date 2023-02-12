import { Request } from 'express';
import { UserType } from '../../server/models/user';

export interface genericRequest extends Request{
    query: {
      type: string | undefined
      pinID: string | undefined
      tag: string | undefined
      deleteId: string | undefined
    }
    user: UserType
    body: {
      owner: {
        name: string,
        service: string,
        id: string,
      },
      imgDescription: string,
      imgLink: string,
      _id: number,
      name: string,
      service: string
      id: string
      comment: string
      picInPreview: string
    } | undefined
    params: {
      _id: string
    }
    isAuthenticated: () => boolean,
}
