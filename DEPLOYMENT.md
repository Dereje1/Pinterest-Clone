# Production Deployment Guide

This document describes the current production deployment process for the Pinterest Clone application.

The production deployment is manual and uses:

- Docker
- AWS Elastic Beanstalk
- Amazon CloudFront
- Amazon Route 53
- AWS Certificate Manager
- MongoDB Atlas
- Amazon S3

---

# Current Production Environment

## Production URL

```text
https://pclone.derejegetahun.com
```

## Elastic Beanstalk environment

```text
Pinterest-Clone-new-env
```

## AWS region

```text
us-east-1
```

## Elastic Beanstalk platform

```text
Docker on Amazon Linux 2023
```

## Application container port

```text
3000
```

## Direct Elastic Beanstalk hostname

```text
http://pinterest-clone-new-env.eba-4m2kepim.us-east-1.elasticbeanstalk.com
```

The direct Elastic Beanstalk hostname is primarily for diagnostics.

Normal production traffic should use:

```text
https://pclone.derejegetahun.com
```

---

# Production Architecture

```text
Browser
   |
   v
Route 53
pclone.derejegetahun.com
   |
   v
CloudFront
HTTPS termination and proxying
   |
   v
Elastic Beanstalk
Pinterest-Clone-new-env
   |
   v
Docker container
Node.js / Express on port 3000
   |
   +--> MongoDB Atlas
   +--> Amazon S3
   +--> OAuth providers
   +--> OpenAI API
```

---

# Resources That Must Be Preserved

Do not delete or recreate these without first confirming the current architecture.

## Elastic Beanstalk environment

```text
Pinterest-Clone-new-env
```

## Production domain

```text
pclone.derejegetahun.com
```

## CloudFront distribution

```text
pclone-production
```

Also preserve:

- production Route 53 records
- ACM certificate used by CloudFront
- MongoDB Atlas database
- S3 image bucket
- existing CloudFront resources used for image delivery
- production Elastic Beanstalk environment variables

---

# Old Elastic Beanstalk Environments

The following old environments have been terminated:

```text
pinterest-clone-prod
pinterest-clone-v3-test
```

Do not use them for future deployments.

All future production deployments should target:

```text
Pinterest-Clone-new-env
```

---

# Production Dockerfile

The production deployment uses the root `Dockerfile`.

```dockerfile
FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build_client
RUN npm run build_server

EXPOSE 3000

CMD ["npm", "start"]
```

The container:

1. uses Node.js 18
2. installs exact dependencies from `package-lock.json`
3. copies the application source
4. builds the React/Vite frontend
5. builds the TypeScript backend
6. starts the compiled Node.js server
7. listens on port `3000`

---

# `.dockerignore`

The current production `.dockerignore` is:

```text
node_modules
.git
.env
*.zip
docker-compose.yml
server_build
client/dist
coverage
myscripts/dump_archives
myscripts/atlas-dump.json
myscripts/atlas-dump-backup.json
```

These exclusions prevent local dependencies, secrets, generated output, archives, and local data dumps from entering the Docker build context.

---

# Important: Do Not Include `docker-compose.yml`

Do not include:

```text
docker-compose.yml
```

in the Elastic Beanstalk deployment bundle.

During restoration, including the Compose configuration caused Elastic Beanstalk to use an unintended deployment path involving local MongoDB behavior and incorrect port mapping.

The working production deployment uses only the root:

```text
Dockerfile
```

---

# Before Deployment

Start from the current `master` branch.

```bash
git checkout master
git pull origin master
```

Run the application locally:

```bash
NODE_ENV=development PORT=3001 npm run dev
```

Verify the affected functionality in:

```text
http://localhost:8080
```

---

# Build Verification

Before creating a deployment bundle, run:

```bash
npm run build_client
npm run build_server
```

Both commands must complete successfully.

The Docker image will rebuild these artifacts during deployment, but local build verification catches compilation failures before uploading to AWS.

For broader validation:

```bash
npm run compileTS
npm run lint
npm run coverage
```

Some legacy tests or lint rules may require separate maintenance.

A successful production build is required before deployment.

---

# Commit and Push

Review the changes:

```bash
git status
git diff
```

Confirm that no secrets or local-only files are being committed.

Then:

```bash
git add .
git commit -m "Describe the deployment"
git push origin master
```

The deployment bundle should normally be created from the same code that has been committed and pushed.

---

# Create the Deployment ZIP

From the repository root:

```bash
rm -f pinterest-clone-deploy.zip
```

Then run:

```bash
zip -r pinterest-clone-deploy.zip . \
  -x "node_modules/*" \
     ".git/*" \
     ".env" \
     "*.zip" \
     "docker-compose.yml" \
     "server_build/*" \
     "client/dist/*" \
     "coverage/*" \
     "myscripts/dump_archives/*" \
     "myscripts/atlas-dump.json" \
     "myscripts/atlas-dump-backup.json"
```

This is the ZIP creation method that was successfully used for the restored production deployment.

---

# ZIP Structure

Run the ZIP command from the repository root.

The archive must contain files such as these directly at the root:

```text
Dockerfile
package.json
package-lock.json
server/
client/
bin/
```

Correct:

```text
pinterest-clone-deploy.zip
├── Dockerfile
├── package.json
├── package-lock.json
├── server/
├── client/
└── bin/
```

Incorrect:

```text
pinterest-clone-deploy.zip
└── Pinterest-Clone/
    ├── Dockerfile
    ├── package.json
    └── ...
```

Elastic Beanstalk must see `Dockerfile` at the root of the uploaded archive.

---

# Inspect the Deployment ZIP

Before uploading:

```bash
unzip -l pinterest-clone-deploy.zip | head -50
```

Confirm:

- `Dockerfile` is at the ZIP root
- `package.json` is at the ZIP root
- `package-lock.json` is present
- `.env` is absent
- `node_modules` is absent
- `.git` is absent
- `docker-compose.yml` is absent
- `server_build` is absent
- `client/dist` is absent
- old ZIP files are absent

---

# Upload a New Elastic Beanstalk Application Version

In the AWS Console:

1. Open **Elastic Beanstalk**.
2. Open the Pinterest Clone application.
3. Go to **Application versions**.
4. Upload:

   ```text
   pinterest-clone-deploy.zip
   ```

5. Give the application version a unique label.

Examples:

```text
pinterest-clone-v5
```

or:

```text
pinterest-clone-2026-07-15
```

Do not reuse an existing application-version label.

---

# Deploy the New Version

After uploading the application version:

1. Open:

   ```text
   Pinterest-Clone-new-env
   ```

2. Choose the option to deploy an application version.
3. Select the new application version.
4. Start the deployment.
5. Wait for Elastic Beanstalk to finish updating.

A deployment may take several minutes.

Elastic Beanstalk will:

- prepare the environment
- build the Docker image
- run `npm ci`
- build the frontend
- build the backend
- start the new container
- replace the old application container
- perform health checks

Do not interrupt the deployment while the environment is updating.

---

# Production Environment Variables

Production environment variables are configured in the Elastic Beanstalk environment.

Examples include:

```text
SESSION_SECRET
MONGOLAB_URI

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK

GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_CALLBACK

TWITTER_CONSUMER_KEY
TWITTER_CONSUMER_SECRET
TWITTER_CALLBACK

AWS_ACCESS_KEY_ID
AWS_SECRET_KEY
S3_BUCKET_NAME

OPENAI_API_KEY

NODE_ENV
```

Do not place production secret values in the repository.

---

# Production OAuth Callbacks

## Google

```text
https://pclone.derejegetahun.com/auth/google/redirect
```

## GitHub

```text
https://pclone.derejegetahun.com/auth/github/redirect
```

Do not replace these production callback URLs with localhost values.

---

# Twitter / X Status

Twitter/X authentication is currently deferred.

X currently flags:

```text
pclone.derejegetahun.com
```

as a malware URL in its developer platform.

The application itself is operational and other OAuth providers work correctly.

Do not change the working Google or GitHub authentication configuration while troubleshooting Twitter/X.

The Twitter/X UI may be disabled separately.

---

# Deployment Verification

After Elastic Beanstalk reports healthy status, verify production.

## 1. Open the production application

```text
https://pclone.derejegetahun.com
```

## 2. Confirm the public application loads

Verify:

- frontend loads
- images appear
- existing pins appear
- feed data loads
- no obvious server error appears

## 3. Confirm authentication

Verify at least one supported OAuth provider:

- Google
- GitHub

## 4. Verify affected authenticated functionality

For changes affecting authenticated behavior, test the relevant function.

Examples:

- create a pin
- delete a pin
- save a pin
- remove a saved pin
- comment
- update tags
- update profile information

## 5. Confirm Elastic Beanstalk health

The environment should return to:

```text
Health: Ok
```

---

# Known Verified Production Functionality

The restored production deployment has been verified for:

- public application loading
- guest access
- MongoDB Atlas reads
- existing pin feed
- Google authentication
- GitHub authentication
- authenticated pin creation
- image upload
- S3-backed image storage
- MongoDB persistence
- persistence after page refresh
- authenticated pin deletion
- HTTPS
- CloudFront proxying
- Elastic Beanstalk deployment

---

# Rollback Procedure

Elastic Beanstalk keeps previous application versions that can be redeployed.

If a deployment fails:

1. Open Elastic Beanstalk.
2. Open:

   ```text
   Pinterest-Clone-new-env
   ```

3. Select a previously known-good application version.
4. Deploy that version.
5. Wait for environment health to return to:

   ```text
   Ok
   ```

6. Verify:

   ```text
   https://pclone.derejegetahun.com
   ```

Do not attempt to recover from a bad deployment by deleting the environment.

Use an application-version rollback first.

---

# Application Version Cleanup

Old Elastic Beanstalk application versions may be deleted periodically.

Before deleting an application version:

1. confirm it is not currently deployed
2. keep the current production version
3. keep at least one known-good rollback version
4. delete only clearly obsolete test, failed, or superseded versions

Do not delete every previous application version.

Keeping at least one known-good rollback bundle is recommended.

---

# Troubleshooting

## Application works locally but deployment fails

Run:

```bash
npm run build_client
npm run build_server
```

Inspect the deployment ZIP:

```bash
unzip -l pinterest-clone-deploy.zip | head -50
```

Confirm `Dockerfile` and `package.json` are at the ZIP root.

---

## Elastic Beanstalk uses the wrong deployment behavior

Confirm:

```text
docker-compose.yml
```

is not inside the deployment ZIP.

The production deployment must use the root `Dockerfile`.

---

## Production container does not start

Confirm the Dockerfile ends with:

```dockerfile
EXPOSE 3000

CMD ["npm", "start"]
```

Confirm `package.json` contains:

```json
"start": "node ./server_build/bin/www"
```

---

## Local development loads the wrong server entry point

Run:

```bash
NODE_ENV=development PORT=3001 npm run dev
```

The application entry-point logic depends on:

```text
NODE_ENV=development
```

for the local TypeScript server path.

---

## OAuth works locally but not in production

Check both:

1. Elastic Beanstalk environment variables
2. OAuth provider callback configuration

The callback URLs must match exactly.

Google:

```text
https://pclone.derejegetahun.com/auth/google/redirect
```

GitHub:

```text
https://pclone.derejegetahun.com/auth/github/redirect
```

---

## Twitter/X reports a malware URL

This is a known external provider issue involving the production hostname.

Do not change the working Google or GitHub authentication configuration while investigating it.

---

# Security

Never:

- commit `.env`
- commit API keys
- commit database credentials
- include `.env` in a deployment ZIP
- expose production credentials in logs
- commit database dumps containing private information

If a credential is exposed, rotate it.

---

# Future Deployment Improvements

Possible future improvements:

- automate deployment with CI/CD
- generate version labels automatically
- add automated deployment smoke tests
- modernize the Node.js runtime
- add structured production logging
- improve rollback automation
- improve dependency and security auditing

These are not required for the current working deployment.