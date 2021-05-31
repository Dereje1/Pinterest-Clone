// used for pin crud actions
import axios from 'axios';

export default async ({ address, callType, payload = null }) => {
  try {
    const { data } = await axios[callType](address, payload);
    return data;
  } catch (error) {
    throw (error);
  }
};
