// used for pin crud actions
import axios from 'axios';

interface methods {
  put: 'put'
  post: 'post'
  delete: 'delete'
  get: 'get'
}

interface pinAddPayload { imgDescription: string, imgLink: string | ArrayBuffer }

interface commentAddPayload { comment: string }

interface duplicateCheckPayload { picInPreview: string | ArrayBuffer }

interface crudTypes {
  address: string
  method: string
  payload: pinAddPayload | commentAddPayload | duplicateCheckPayload | undefined
}

export default async ({ address, method = 'get', payload }: crudTypes) => {
  try {
    const { data } = await axios[method as keyof methods](address, payload);
    return data;
  } catch (error) {
    console.log(`An error occured making a REST call${error}`);
    throw (error);
  }
};
