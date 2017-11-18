"use strict"//self explanatory pin crud actions non of these are dispatched to the redux store
import axios from 'axios'

export function addPin(pinInfo){
  return new Promise((resolve,reject)=>{
    axios.post('/api/newpin',pinInfo)
      .then((response)=>{
        resolve(response.data)
      })
      .catch((err)=>{
        reject(err.data)
      })
  })
}

export function getPins(query){
  return new Promise((resolve,reject)=>{
    axios.get('/api/'+query)
    .then((response)=>{
      resolve(response.data)
    })
    .catch((err)=>{
      reject(err.data)
    })
  })
}

export function deletePin(query){
  return new Promise((resolve,reject)=>{
    axios.delete('/api/'+query)
    .then((response)=>{
      resolve(response.data)
    })
    .catch((err)=>{
      reject(err.data)
    })
  })
}

export function updatePin(query,savedby){
  return new Promise((resolve,reject)=>{
    axios.put('/api/'+query,savedby)
    .then((response)=>{
      resolve(response.data)
    })
    .catch((err)=>{
      reject(err.data)
    })
  })
}
