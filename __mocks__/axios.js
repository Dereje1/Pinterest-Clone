
module.exports = {
  get: (...args) => {
    const route = args[0];
    if (route === '/successful') {
      return Promise.resolve({
        data: 'data returned succesfully!',
      });
    }
    return Promise.reject(
      new Error('Axios request rejected'),
    );
  },
};
