# Pinterest-Clone

[![codecov](https://codecov.io/gh/Dereje1/Pinterest-Clone/branch/master/graph/badge.svg?token=k3bnvXaDh3)](https://codecov.io/gh/Dereje1/Pinterest-Clone)

### A clone of the Pinterest application for educational purposes

Explore the live application: [Pinterest-Clone](https://pclone.derejegetahun.com/)

Use the app to generate images using a web link, upload your own images, or use OpenAI’s cutting-edge image generation technology.

![Screenshot](https://github.com/Dereje1/Pinterest-Clone/assets/23533048/e5849734-ec10-4a32-ba0b-1230a8cfb489)

## Getting Started

These instructions will help you get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following tools installed:

| Tool                                       | Version   |
|--------------------------------------------|-----------|
| [Node.js](https://nodejs.org/) / npm       | ~18.3.0 / ~8.19.3 |
| [Git](https://git-scm.com/)                | ~2        |

Optional tools:

| Tool                                       | Version   |
|--------------------------------------------|-----------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop) | ~4.4.2 |
| [MongoDB Compass](https://www.mongodb.com/products/compass) | ~1.0.0 |

### Installing

1. **Create a new directory and initialize Git:**

    ```sh
    mkdir Pinterest-Clone
    cd Pinterest-Clone
    git init
    ```

2. **Clone the repository and install packages:**

    ```sh
    git pull https://github.com/Dereje1/Pinterest-Clone.git
    npm install
    ```

3. **Run MongoDB locally with Docker:**

    In the root folder, run:

    ```sh
    docker-compose up mongodb
    ```

    Alternatively, you can get a connection string from MongoDB Atlas after setting up your own database.

4. **Create `.env` file:**

    In the root of the project, create a `.env` file with the following contents:

    ```env
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
    OPENAI_API_KEY=<Get from OpenAI>
    ```

5. **Run the development environment:**

    ```sh
    npm run dev
    ```

    You can now go to `http://localhost:8080/` and see the project running in dev mode.

### Using Docker

If you have Docker installed and a `.env` file with the contents from above, then from the root directory:

1. **Build and run the images:**

    ```sh
    docker-compose up
    ```

2. **Access the application:**

    Go to `http://localhost:8080/`

    *Note: `MONGOLAB_URI` is already incorporated in the local Docker setup and is not needed in your `.env` file if fully running with Docker.*

## Testing & Build

### Testing

```sh
npm test
```

```sh
npm run coverage
```

### Lint

```sh
npm run lint
```

### Compile TypeScript

```sh
npm run compileTS
```

### Build

```sh
npm run build_server && npm run build_client
```

### Run

```sh
npm start
```

## Built With

* [Node.js](https://nodejs.org/) - JavaScript runtime
* [React](https://reactjs.org/) - A JavaScript library for building user interfaces
* [MongoDB](https://www.mongodb.com/) - Database
* [Express](https://expressjs.com/) - Node.js web application framework
* [Material UI](https://mui.com/) - A library of React UI components that implements Google's Material Design
* [OpenAI](https://www.openai.com/) - AI-based image generation
* [...and more](https://github.com/Dereje1/Pinterest-Clone/blob/master/package.json)

## Authors

* **Dereje Getahun** - [Dereje Getahun](https://github.com/Dereje1)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
