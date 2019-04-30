// self explanatory pin crud actions non of these are dispatched to the redux store
import axios from 'axios';

export const addPin = pinInfo => new Promise((resolve, reject) => {
  axios.post('/api/newpin', pinInfo)
    .then((response) => {
      resolve(response.data);
    })
    .catch((err) => {
      reject(err.data);
    });
});

export const getPins = query => new Promise((resolve, reject) => {
  axios.get(`/api/?type=${query}`)
    .then((response) => {
      resolve(response.data);
    })
    .catch((err) => {
      reject(err.data);
    });
});

export const deletePin = query => new Promise((resolve, reject) => {
  axios.delete(`/api/${query}`)
    .then((response) => {
      resolve(response.data);
    })
    .catch((err) => {
      reject(err.data);
    });
});

export const updatePin = (query, savedby) => new Promise((resolve, reject) => {
  axios.put(`/api/${query}`, savedby)
    .then((response) => {
      resolve(response.data);
    })
    .catch((err) => {
      reject(err.data);
    });
});
