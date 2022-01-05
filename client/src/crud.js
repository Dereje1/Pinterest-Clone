// used for pin crud actions
import axios from 'axios';

export default async ({ address, method = 'get', payload = null }) => {
  try {
    const { data } = await axios[method](address, payload);
    return data;
  } catch (error) {
    throw (error);
  }
};
