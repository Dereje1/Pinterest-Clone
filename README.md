# Pinterest-Clone
[![codecov](https://codecov.io/gh/Dereje1/Pinterest-Clone/branch/master/graph/badge.svg?token=k3bnvXaDh3)](https://codecov.io/gh/Dereje1/Pinterest-Clone)
### A clone of the Pinterest application for educational purposes
https://dereje-pclone.herokuapp.com/

![Screenshot (45)](https://user-images.githubusercontent.com/23533048/56138593-34949880-5f65-11e9-8507-e4cb12e6bcce.png)

# Getting Started
# A) Local
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

| Prerequisite                                | Version |
| ------------------------------------------- | ------- |
| [Node.js](http://nodejs.org) /  npm (comes with Node)  | `~ ^14.18.0` / `~^6.14.15` |
| [Git](https://git-scm.com/downloads) | `~ ^2` |
| [MongoDB Community Server](https://docs.mongodb.com/manual/administration/install-community/) | `~ ^3.4.9`  |


### Installing

>Create a new directory and initialize git

```
$ mkdir Pinterest-Clone
$ cd Pinterest-Clone
$ git init
```
>Pull from github and install packages

```
$ git pull https://github.com/Dereje1/Pinterest-Clone.git
$ npm install
```

>To run mongoDB locally with docker :
<br/>

In the root folder run
`docker-compose up mongodb` and then use `mongodb://root:123456@localhost:27017` for `MONGOLAB_URI`
in your `.env `file below, alternatively, you can get a connection string from mongodb Atlas after setting up your own db.


>create .env files

In the root of the project create a .env file with the following contents
```

SESSION_SECRET=<Secret for Express Session>
MONGOLAB_URI=<Mongo Connection URI>
TWITTER_CONSUMER_KEY=< Get from Twitter Developer API >
TWITTER_CONSUMER_SECRET=< Get from Twitter Developer API >
TWITTER_CALLBACK=http://localhost:8080/auth/twitter/callback
GOOGLE_CLIENT_ID=< Get from Google Developer API >
GOOGLE_CLIENT_SECRET=< Get from Google Developer API >
GOOGLE_CALLBACK=http://localhost:8080/auth/google/redirect
```
Run development environment
```
$ npm run dev
```
You can now go to `http://localhost:8080/` and see the project running in dev mode.

# B) Docker
If you have docker installed and a `.env` file with contents from above, then from the root dir:
1. Build and run the images
```
docker-compose up
```
2. Go to  `http://localhost:8080/`
* Note: MONGOLAB_URI is already incorporated in the local docker setup and is not needed for your env file if fully running with docker.
<br/>

## Built With

* [MongoDB](https://www.mongodb.com/) - Database
* [Express](https://expressjs.com/) - Node.js web application framework
* [React](https://reactjs.org/) - A JavaScript library for building user interfaces
* [Node.js](https://nodejs.org/) - JavaScript runtime
* [react-masonry-component](https://www.npmjs.com/package/react-masonry-component) - A React.js Masonry component.
 
## Authors

* **Dereje Getahun** - [Dereje Getahun](https://github.com/Dereje1)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone who's code was used
