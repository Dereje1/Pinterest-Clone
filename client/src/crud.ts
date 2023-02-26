// used for pin crud actions
import axios from 'axios';

interface methods {
  put: 'put'
  post: 'post'
  delete: 'delete'
  get: 'get'
}
interface crudTypes {
  address: string
  method?: keyof methods
  payload?: {
    [key: string]: string | ArrayBuffer
  }
}

export default async ({ address, method = 'get', payload }: crudTypes) => {
  try {
    const { data } = await axios[method as keyof methods](address, payload);
    return data;
  } catch (error) {
    console.log(`An error occured making a ${method} REST call to -> ${address} error -> ${error}`);
    throw (error);
  }
};
