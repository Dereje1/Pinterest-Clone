# Pinterest-Clone
[![codecov](https://codecov.io/gh/Dereje1/Pinterest-Clone/branch/master/graph/badge.svg?token=k3bnvXaDh3)](https://codecov.io/gh/Dereje1/Pinterest-Clone)
### A clone of the Pinterest application for educational purposes
https://pinterest-clone-oct6.onrender.com/

![Screenshot (45)](https://github.com/Dereje1/Pinterest-Clone/assets/23533048/e5849734-ec10-4a32-ba0b-1230a8cfb489)

# Getting Started
## A) Local
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

| Prerequisite                                | Version |
| ------------------------------------------- | ------- |
| [Node.js](http://nodejs.org) /  npm (comes with Node)  | `~ ^18.3.0` / `~^8.19.3` |
| [Git](https://git-scm.com/downloads) | `~ ^2` |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) (optional) | `~ ^4.4.2` |

### Installing

>Create a new directory and initialize git

```
mkdir Pinterest-Clone
cd Pinterest-Clone
git init
```
>Pull from github and install packages

```
git pull https://github.com/Dereje1/Pinterest-Clone.git

npm install
```

>To run mongoDB locally with docker :

In the root folder run
```
docker-compose up mongodb
```
Alternatively, you can get a connection string from mongodb Atlas after setting up your own db.

>create .env files

In the root of the project create a .env file with the following contents
```

SESSION_SECRET=<Secret for Express Session>
MONGOLAB_URI=mongodb://root:123456@localhost:27017
TWITTER_CONSUMER_KEY=< Get from Twitter Developer API >
TWITTER_CONSUMER_SECRET=< Get from Twitter Developer API >
TWITTER_CALLBACK=http://localhost:8080/auth/twitter/redirect
GOOGLE_CLIENT_ID=< Get from Google Developer API >
GOOGLE_CLIENT_SECRET=< Get from Google Developer API >
GOOGLE_CALLBACK=http://localhost:8080/auth/google/redirect
GITHUB_CLIENT_ID=< Get from Github Developer API >
GITHUB_CLIENT_SECRET=< Get from Github Developer API >
GITHUB_CALLBACK=http://localhost:8080/auth/github/redirect
AWS_ACCESS_KEY_ID=< Get from AWS >
AWS_SECRET_KEY=< Get from AWS >
S3_BUCKET_NAME=< s3 bucket name for uploaded pins>
NODE_ENV=<development|production>
DEBUG=Pinterest-Clone:server
DEBUG_COLORS=1
GOOGLE_APPLICATION_CREDENTIALS=< service account key path for cloud vision api >
```
Run the development environment
```
npm run dev
```
You can now go to `http://localhost:8080/` and see the project running in dev mode.

## B) Docker
If you have docker installed and a `.env` file with contents from above, then from the root dir:
1. Build and run the images
```
docker-compose up
```
2. Go to  `http://localhost:8080/`
* Note: MONGOLAB_URI is already incorporated in the local docker setup and is not needed for your env file if fully running with docker.
<br/>

# Testing
```
npm test
```

## Built With

* [Node.js](https://nodejs.org/) - JavaScript runtime
* [React](https://reactjs.org/) - A JavaScript library for building user interfaces
* [MongoDB](https://www.mongodb.com/) - Database
* [Express](https://expressjs.com/) - Node.js web application framework
* [Material UI](https://mui.com/) - A library of React UI components that implements Google's Material Design.
* [Google Cloud Vision API](https://cloud.google.com/vision/docs) - image labeling, face and landmark detection...
* [...and more](https://github.com/Dereje1/Pinterest-Clone/blob/master/package.json#L18)

## Authors

* **Dereje Getahun** - [Dereje Getahun](https://github.com/Dereje1)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone who's code was used
