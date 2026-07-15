# Pinboard

[![codecov](https://codecov.io/gh/Dereje1/Pinterest-Clone/branch/master/graph/badge.svg?token=k3bnvXaDh3)](https://codecov.io/gh/Dereje1/Pinterest-Clone)

### An educational Pinterest-inspired full-stack application built as a learning project

Explore the live application: [Pinboard](https://pclone.derejegetahun.com/)

Use the app to generate images using a web link, upload your own images, or use OpenAI image generation.

![Screenshot](https://github.com/Dereje1/Pinterest-Clone/assets/23533048/e5849734-ec10-4a32-ba0b-1230a8cfb489)

## Getting Started

These instructions will help you get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following tools installed:

| Tool | Version |
|---|---|
| [Node.js](https://nodejs.org/) / npm | Node.js 18 / npm |
| [Git](https://git-scm.com/) | 2+ |

Optional tools:

| Tool | Purpose |
|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop) | Local container testing |
| [MongoDB Compass](https://www.mongodb.com/products/compass) | MongoDB inspection |

### Installing

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Dereje1/Pinterest-Clone.git
   cd Pinterest-Clone
   ```

2. **Install packages:**

   ```sh
   npm install
   ```

   For a clean install using the committed lockfile:

   ```sh
   npm ci
   ```

3. **Create a `.env` file:**

   In the root of the project, create a `.env` file with the following contents:

   ```env
   SESSION_SECRET=<Secret for Express Session>

   MONGOLAB_URI=<MongoDB connection string>

   TWITTER_CONSUMER_KEY=<Get from Twitter/X Developer API>
   TWITTER_CONSUMER_SECRET=<Get from Twitter/X Developer API>
   TWITTER_CALLBACK=http://localhost:8080/auth/twitter/redirect

   GOOGLE_CLIENT_ID=<Get from Google Developer API>
   GOOGLE_CLIENT_SECRET=<Get from Google Developer API>
   GOOGLE_CALLBACK=http://localhost:8080/auth/google/redirect

   GITHUB_CLIENT_ID=<Get from GitHub Developer settings>
   GITHUB_CLIENT_SECRET=<Get from GitHub Developer settings>
   GITHUB_CALLBACK=http://localhost:8080/auth/github/redirect

   AWS_ACCESS_KEY_ID=<Get from AWS>
   AWS_SECRET_KEY=<Get from AWS>
   S3_BUCKET_NAME=<S3 bucket name for uploaded pins>

   OPENAI_API_KEY=<Get from OpenAI>

   NODE_ENV=development

   DEBUG=Pinterest-Clone:server
   DEBUG_COLORS=1
   ```

   Never commit the `.env` file or production secrets.

4. **Run the development environment:**

   ```sh
   NODE_ENV=development PORT=3001 npm run dev
   ```

   The frontend runs at:

   ```text
   http://localhost:8080/
   ```

   The local backend runs on port:

   ```text
   3001
   ```

## Using Docker

The production application is built from the root `Dockerfile`.

To build the application image locally:

```sh
docker build -t pinterest-clone .
```

To run it locally, provide the required environment variables and expose the application port:

```sh
docker run --env-file .env -p 3000:3000 pinterest-clone
```

Then open:

```text
http://localhost:3000/
```

The production Elastic Beanstalk deployment uses the root `Dockerfile` directly.

`docker-compose.yml` is not included in the production deployment bundle.

## Production Deployment

The live application is deployed manually using Docker and AWS Elastic Beanstalk.

Production URL:

```text
https://pclone.derejegetahun.com
```

Current Elastic Beanstalk environment:

```text
Pinterest-Clone-new-env
```

The production stack includes:

- AWS Elastic Beanstalk
- Docker
- Amazon CloudFront
- Amazon Route 53
- AWS Certificate Manager
- MongoDB Atlas
- Amazon S3

For the complete step-by-step deployment, rollback, verification, troubleshooting, and infrastructure instructions, see:

[DEPLOYMENT.md](DEPLOYMENT.md)

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

Build the server:

```sh
npm run build_server
```

Build the client:

```sh
npm run build_client
```

Build both:

```sh
npm run build_server && npm run build_client
```

### Run

After the application has been built:

```sh
npm start
```

## Current Service Status

### Authentication

Google authentication is working in production.

GitHub authentication is working in production.

Twitter/X authentication is currently deferred because X is flagging the production hostname as a malware URL in its developer platform. The rest of the application is not affected.

### OpenAI Image Generation

The application contains an OpenAI image-generation feature.

The current implementation uses an older image-generation integration and may require modernization to use current supported OpenAI image-generation models and APIs.

Normal image upload and pin creation work independently of the AI image-generation feature.

## Built With

* [Node.js](https://nodejs.org/) - JavaScript runtime
* [React](https://reactjs.org/) - A JavaScript library for building user interfaces
* [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
* [MongoDB](https://www.mongodb.com/) - Database
* [Express](https://expressjs.com/) - Node.js web application framework
* [Material UI](https://mui.com/) - React UI components
* [Redux](https://redux.js.org/) - State management
* [Vite](https://vitejs.dev/) - Frontend build tooling
* [Docker](https://www.docker.com/) - Containerization
* [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) - Application hosting
* [Amazon S3](https://aws.amazon.com/s3/) - Image storage
* [Amazon CloudFront](https://aws.amazon.com/cloudfront/) - Content delivery and production proxy
* [OpenAI](https://www.openai.com/) - AI-based image generation
* [...and more](https://github.com/Dereje1/Pinterest-Clone/blob/master/package.json)

## Authors

* **Dereje Getahun** - [Dereje Getahun](https://github.com/Dereje1)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

* Hat tip to anyone whose code was used