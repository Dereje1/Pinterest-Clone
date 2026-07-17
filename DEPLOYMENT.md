# Production Deployment Guide

This document is the authoritative manual runbook for deploying the public Pinboard application to production.

Production deployment is manual. Docker images are built and tested outside Elastic Beanstalk, pushed to a private Amazon ECR repository, and then deployed by Elastic Beanstalk from a small `Dockerrun.aws.json` bundle. During normal production deployment, Elastic Beanstalk must not build the application source.

The deployment path changed. The application architecture and surrounding production infrastructure did not.

---

## Current Production Environment

### Production URL

```text
https://pclone.derejegetahun.com
```

### Elastic Beanstalk application and environment

```text
Pinterest-Clone
Pinterest-Clone-new-env
```

### AWS region

```text
us-east-1
```

### Elastic Beanstalk platform

```text
Docker on Amazon Linux 2023
```

### Application container port

```text
3000
```

### Direct Elastic Beanstalk hostname

```text
http://pinterest-clone-new-env.eba-4m2kepim.us-east-1.elasticbeanstalk.com
```

The direct Elastic Beanstalk hostname is primarily for diagnostics. Normal production traffic should use `https://pclone.derejegetahun.com`.

---

## Production Architecture

### Runtime traffic

```text
Browser
  → Route 53
  → CloudFront
  → Elastic Beanstalk
  → Docker container
  → MongoDB Atlas / S3 / OAuth / OpenAI
```

### Deployment artifact path

```text
Git repository
    |
    v
Local Docker build (`linux/amd64`)
    |
    v
Local container test
    |
    v
Private Amazon ECR
    |
    v
Elastic Beanstalk via `Dockerrun.aws.json`
    |
    v
Production container on port 3000
```

The working production deployment uses a prebuilt image. The historical source-build path is not the normal deployment method anymore.

---

## Resources That Must Be Preserved

Do not delete or recreate these without first confirming the current architecture.

```text
Elastic Beanstalk environment: Pinterest-Clone-new-env
Production domain: pclone.derejegetahun.com
CloudFront distribution name: pclone-production
```

Also preserve:

- production Route 53 records
- ACM certificate used by CloudFront
- MongoDB Atlas database
- S3 image bucket and image delivery configuration
- OAuth application settings
- OpenAI integration settings
- production Elastic Beanstalk environment variables

The production environment variables remain configured in Elastic Beanstalk and are supplied at container runtime.

---

## Old Elastic Beanstalk Environments

The following old environments have been terminated:

```text
pinterest-clone-prod
pinterest-clone-v3-test
```

Do not use them for future deployments. All future production deployments should target `Pinterest-Clone-new-env` unless the production architecture is intentionally changed in separately scoped work.

---

## Root Dockerfile

The application image is still built from the repository root `Dockerfile`.

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

The Dockerfile currently:

1. uses Node.js 18
2. installs exact dependencies from `package-lock.json`
3. copies the application source into the image build context
4. builds the React/Vite frontend
5. builds the TypeScript backend
6. starts the compiled Node.js server
7. exposes port `3000`

Important distinction:

- The Dockerfile is used during the local/prebuilt image build.
- The Dockerfile is not included in the minimal Elastic Beanstalk deployment ZIP.
- Elastic Beanstalk does not normally execute this Dockerfile anymore.

Do not redesign or modernize the Dockerfile as part of a deployment run. Dockerfile improvements should be handled in separately scoped work.

---

## `.dockerignore`

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

These exclusions protect the local Docker image build context. They prevent local dependencies, secrets, generated output, archives, and local data dumps from being copied into the image build context.

This is separate from the Elastic Beanstalk deployment ZIP. The normal Elastic Beanstalk ZIP contains only `Dockerrun.aws.json` and does not use `.dockerignore`.

`.env` must not be copied into the Docker image. For local testing, pass `.env` only at runtime with `--env-file .env`.

---

## One-Time Setup Versus Every Deployment

### Normally done only once

| Setup item | Purpose | Production impact |
|---|---|---|
| Create a private ECR repository | Stores tested application images | No running production change by itself |
| Give the Elastic Beanstalk EC2 instance role ECR pull permission | Allows the environment to download the private image | No application version change by itself |
| Retain existing CloudFront, Route 53, and TLS configuration | Keeps the current public production path | Do not change during a normal deployment |
| Confirm production environment properties | Ensures runtime secrets and settings remain in Elastic Beanstalk | Do not print or commit secret values |

### Done for every deployment

1. Update `master` and understand the source state.
2. Record the intended commit SHA.
3. Build a `linux/amd64` Docker image.
4. Run the exact image locally.
5. Tag and push the tested image to ECR.
6. Record the ECR image digest.
7. Create `Dockerrun.aws.json` for that image tag.
8. ZIP only `Dockerrun.aws.json`.
9. Register a unique Elastic Beanstalk application version.
10. Perform a pre-deployment safety check.
11. Deploy the application version.
12. Monitor Elastic Beanstalk.
13. Verify production behavior.
14. Retain an earlier known-good application version for rollback.

---

## AWS CLI Context Checks

These commands confirm which AWS account and region your CLI is using. They assume the AWS CLI is already authenticated through an appropriate IAM user, IAM Identity Center session, or assumed role.

```bash
aws sts get-caller-identity
aws configure get region
```

What this does: prints the active AWS identity and default region.

Production impact: none.

Success looks like: the account and region are the intended deployment context.

What not to do:

- Do not paste or commit credential output.
- Do not document access keys, secret keys, session tokens, ECR login passwords, or account-specific ARNs.
- Use a least-privileged deployment identity such as an appropriate IAM user, IAM Identity Center session, or assumed role.
- Do not make credential migration part of this deployment guide.

---

## ECR Prerequisite

A private ECR repository must already exist, or it must be created once before the first prebuilt-image deployment.

Reusable one-time creation example:

```bash
aws ecr create-repository \
  --repository-name <ECR_REPOSITORY_NAME> \
  --region <AWS_REGION> \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256
```

The private repository URI has this form:

```text
<AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/<ECR_REPOSITORY_NAME>
```

Do not place the real AWS account ID in public documentation.

---

## Elastic Beanstalk EC2 Role ECR Permission

The Elastic Beanstalk EC2 instance role must be able to authenticate to ECR and download the image.

This is normally a one-time infrastructure prerequisite. The policy belongs on the Elastic Beanstalk EC2 instance role, not only on the Elastic Beanstalk service role. Verify existing permissions before adding a duplicate policy. Do not remove or rewrite unrelated role permissions.

Least-privilege policy template:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowECRAuthentication",
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    },
    {
      "Sid": "AllowApplicationImagePull",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "arn:aws:ecr:<AWS_REGION>:<AWS_ACCOUNT_ID>:repository/<ECR_REPOSITORY_NAME>"
    }
  ]
}
```

---

## Deployment Runbook

### 1. Verify source state

```bash
git checkout master
git pull origin master
git status
git branch --show-current
git rev-parse HEAD
git log -5 --oneline
```

What this does: confirms the source commit that will be built.

Production impact: none.

Success looks like: the working tree is understood and the image tag corresponds to the intended commit.

What not to do: do not build an image from an unknown or unintended working tree. Record the commit SHA in deployment notes.

### 2. Build a `linux/amd64` image locally

The current Elastic Beanstalk EC2 environment uses x86-64. Production images must target:

```text
linux/amd64
```

Build command:

```bash
docker buildx build \
  --platform linux/amd64 \
  --progress=plain \
  --load \
  -t pinboard:<IMAGE_TAG> \
  .
```

`--load` loads the single-platform result into the local Docker image store so the exact image can be tested before pushing.

Production impact: none.

Success looks like: Docker completes the build and a local `pinboard:<IMAGE_TAG>` image exists.

Verify image architecture:

```bash
docker image inspect pinboard:<IMAGE_TAG> \
  --format 'Architecture={{.Architecture}} OS={{.Os}} ID={{.Id}}'
```

Expected:

```text
Architecture=amd64 OS=linux
```

### 3. Test the exact image locally

```bash
docker run --rm \
  --platform linux/amd64 \
  -p 3001:3000 \
  --env-file .env \
  -e NODE_ENV=production \
  -e PORT=3000 \
  pinboard:<IMAGE_TAG>
```

What this does: runs the same image that will be pushed to ECR, with local runtime environment variables.

Production impact: none.

Success looks like:

- container starts
- MongoDB connects
- homepage loads at `http://localhost:3001`
- Pinboard branding appears
- existing pins load
- no startup error appears

What not to do:

- Do not push an untested image.
- Do not bake `.env` into the image.
- Do not copy secret values into documentation or logs.

### 4. Log in to ECR, tag, push, and verify

Log in without printing the ECR password:

```bash
aws ecr get-login-password --region <AWS_REGION> \
  | docker login \
      --username AWS \
      --password-stdin \
      <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com
```

Tag the tested local image:

```bash
docker tag \
  pinboard:<IMAGE_TAG> \
  <ECR_REPOSITORY_URI>:<IMAGE_TAG>
```

Push it:

```bash
docker push <ECR_REPOSITORY_URI>:<IMAGE_TAG>
```

Verify the image exists in ECR:

```bash
aws ecr describe-images \
  --repository-name <ECR_REPOSITORY_NAME> \
  --image-ids imageTag=<IMAGE_TAG> \
  --region <AWS_REGION> \
  --query 'imageDetails[0].{
    Tags:imageTags,
    Digest:imageDigest,
    PushedAt:imagePushedAt,
    SizeBytes:imageSizeInBytes
  }'
```

What this does: uploads the tested image to private ECR and confirms ECR has it.

Production impact: none until Elastic Beanstalk is updated to use this image.

Success looks like: ECR returns the tag, digest, push time, and size. The digest identifies the immutable image content and should be recorded in deployment notes.

What not to do: do not rely only on `latest`. Use unique, non-reused deployment tags.

### 5. Create `Dockerrun.aws.json`

Create a root-level file named `Dockerrun.aws.json` for the image tag being deployed:

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "<ECR_REPOSITORY_URI>:<IMAGE_TAG>",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "3000"
    }
  ]
}
```

Field notes:

- `AWSEBDockerrunVersion` is Elastic Beanstalk single-container Docker v1 format.
- `Image.Name` must reference the private ECR image tag.
- `Image.Update` tells Elastic Beanstalk to pull the image during deployment.
- `ContainerPort` must match the application container port, `3000`.

Rules:

- No secret belongs in this file.
- No host-port mapping belongs in this file.
- A digest reference may be used later if intentionally adopted, but the currently proven workflow uses a unique image tag.

### 6. Create the minimal Elastic Beanstalk ZIP

The current normal deployment ZIP must contain only this root-level file:

```text
Dockerrun.aws.json
```

Correct structure:

```text
pinboard-ecr-<version>.zip
└── Dockerrun.aws.json
```

Incorrect structure:

```text
pinboard-ecr-<version>.zip
└── pinboard-ecr-<version>/
    └── Dockerrun.aws.json
```

Create the ZIP:

```bash
DEPLOY_VERSION="<EB_APPLICATION_VERSION>"
BUNDLE_DIR="/tmp/$DEPLOY_VERSION"

mkdir -p "$BUNDLE_DIR"
cp Dockerrun.aws.json "$BUNDLE_DIR/"
cd "$BUNDLE_DIR"
zip "$DEPLOY_VERSION.zip" Dockerrun.aws.json
unzip -l "$DEPLOY_VERSION.zip"
```

What this does: creates the Elastic Beanstalk source bundle that points to the already-built ECR image.

Production impact: none.

Success looks like: the ZIP is only a few hundred bytes and `unzip -l` shows exactly one root-level `Dockerrun.aws.json` file.

The deployment ZIP must not contain:

- the repository source
- `Dockerfile`
- `docker-compose.yml`
- `.env`
- `node_modules`
- previously generated ZIP files

### 7. Register an Elastic Beanstalk application version

The CLI path below is the authoritative path. The console can also upload the same ZIP as a new application version, but the same rules apply: use a unique version label and do not overwrite or delete the currently deployed version.

```bash
EB_BUCKET=$(aws elasticbeanstalk create-storage-location \
  --region <AWS_REGION> \
  --query 'S3Bucket' \
  --output text)

aws s3 cp \
  "/tmp/<EB_APPLICATION_VERSION>/<EB_APPLICATION_VERSION>.zip" \
  "s3://$EB_BUCKET/pinboard/<EB_APPLICATION_VERSION>.zip" \
  --region <AWS_REGION>

aws elasticbeanstalk create-application-version \
  --application-name <EB_APPLICATION_NAME> \
  --version-label <EB_APPLICATION_VERSION> \
  --description "Prebuilt Pinboard Docker image from private ECR" \
  --source-bundle \
    S3Bucket="$EB_BUCKET",S3Key="pinboard/<EB_APPLICATION_VERSION>.zip" \
  --region <AWS_REGION>
```

What this does: uploads the tiny bundle to S3 and registers it as an Elastic Beanstalk application version.

Production impact: none until the environment is updated to this version.

Success looks like: Elastic Beanstalk accepts the new version label. `UNPROCESSED` immediately after registration is not necessarily an error; configuration validation may occur at deployment time.

The image itself is in ECR. The S3 ZIP only contains the `Dockerrun.aws.json` instruction.

### 8. Pre-deployment safety check

Confirm the current environment is healthy before changing production:

```bash
aws elasticbeanstalk describe-environments \
  --application-name <EB_APPLICATION_NAME> \
  --environment-names <EB_ENVIRONMENT_NAME> \
  --region <AWS_REGION> \
  --query 'Environments[0].{
    Status:Status,
    Health:Health,
    HealthStatus:HealthStatus,
    VersionLabel:VersionLabel,
    AbortableOperationInProgress:AbortableOperationInProgress
  }'
```

Required state:

```text
Status: Ready
Health: Green
HealthStatus: Ok
AbortableOperationInProgress: false
```

Also confirm `https://pclone.derejegetahun.com` loads before deployment.

Production impact: none.

What not to do: do not start a deployment while another operation is in progress or while production is already unhealthy unless this is an intentional recovery action.

### 9. Deploy the application version

```bash
aws elasticbeanstalk update-environment \
  --environment-name <EB_ENVIRONMENT_NAME> \
  --version-label <EB_APPLICATION_VERSION> \
  --region <AWS_REGION>
```

This is the point where production begins changing.

Expected behavior:

- Elastic Beanstalk reads `Dockerrun.aws.json`.
- Elastic Beanstalk authenticates to ECR using the EC2 instance role.
- Elastic Beanstalk pulls the finished image.
- Elastic Beanstalk starts the container.
- Traffic is routed to container port `3000`.
- Health checks run.

The normal deployment must not run:

```text
docker build -t aws_beanstalk/staging-app ...
```

If Elastic Beanstalk performs a Docker build, the bundle was not recognized correctly or contains unintended files.

### 10. Monitor deployment

Use this macOS-compatible status loop:

```bash
while true; do
  clear
  date
  aws elasticbeanstalk describe-environments \
    --environment-names <EB_ENVIRONMENT_NAME> \
    --region <AWS_REGION> \
    --query 'Environments[0].{
      Status:Status,
      Health:Health,
      HealthStatus:HealthStatus,
      Version:VersionLabel,
      Abortable:AbortableOperationInProgress
    }'
  sleep 10
done
```

In another terminal, monitor recent events:

```bash
while true; do
  clear
  date
  aws elasticbeanstalk describe-events \
    --environment-name <EB_ENVIRONMENT_NAME> \
    --region <AWS_REGION> \
    --max-items 12 \
    --query 'Events[].{
      Time:EventDate,
      Severity:Severity,
      Message:Message
    }'
  sleep 10
done
```

`Ctrl+C` stops only the local monitoring loop. It does not cancel or change the AWS deployment.

### 11. Verify production

Do not claim full success merely because the Elastic Beanstalk update command completed. Verify the running application.

Required checks:

- environment returns to `Ready / Green / Ok`
- running application version matches `<EB_APPLICATION_VERSION>`
- `https://pclone.derejegetahun.com` loads
- Pinboard branding appears
- guest mode works
- existing pins load
- S3 images render
- MongoDB data remains intact
- login routes render
- Google authentication is checked where practical
- GitHub authentication is checked where practical
- Twitter/X is checked only according to its documented current status
- affected authenticated features are tested
- environment variables are still being supplied at runtime by Elastic Beanstalk
- no secrets were baked into the image

---

## Rollback

Keep an earlier known-good Elastic Beanstalk application version available.

CLI rollback:

```bash
aws elasticbeanstalk update-environment \
  --environment-name <EB_ENVIRONMENT_NAME> \
  --version-label <KNOWN_GOOD_VERSION> \
  --region <AWS_REGION>
```

Rollback changes the Elastic Beanstalk application version. It does not delete ECR images, DNS, MongoDB, S3, CloudFront, or the environment.

Do not terminate the environment as a first recovery action. If an unhealthy deployment reproduces a `No Data` or unavailable production state, allow rollback to complete first and inspect logs before considering an EC2 reboot.

---

## Troubleshooting

### ECR authentication or authorization failure

Check:

- correct account and region
- exact ECR repository URI
- image exists
- Elastic Beanstalk EC2 role has pull access
- permissions include `GetAuthorizationToken`, `BatchCheckLayerAvailability`, `GetDownloadUrlForLayer`, and `BatchGetImage`

### Architecture mismatch

Symptoms may include:

```text
exec format error
```

Rebuild explicitly for `linux/amd64`.

### Image works locally but container fails in production

Check:

- `NODE_ENV=production`
- `PORT=3000`
- Elastic Beanstalk environment properties
- server listens on `0.0.0.0`
- container logs
- same image tag/digest was tested locally

### Unexpected Docker build

If logs show:

```text
docker build ...
```

check that:

- deployment ZIP contains only root-level `Dockerrun.aws.json`
- no Dockerfile is included
- no full source tree is included
- JSON syntax is valid
- `AWSEBDockerrunVersion` is `"1"`

Do not wait through another prolonged source build.

### Health-check failure

Check:

- port `3000`
- application startup logs
- proxy behavior
- health-check path
- environment properties

Do not change DNS as a first response.

---

## Why the Deployment Workflow Changed

The previous source-build workflow is historical and unreliable for this environment. It sent a full source bundle to Elastic Beanstalk and expected the EC2 instance to build the Docker image, install dependencies, compile the frontend and backend, and then start the container.

The workflow changed because:

- the exact application bundle built successfully locally
- the exact image ran successfully locally
- Elastic Beanstalk source deployments repeatedly stalled during the on-instance Docker build
- the problem reproduced after an EC2 instance replacement and root-volume increase
- the precise internal Dockerfile step causing the stall was never proven
- using a prebuilt image removes the unreliable on-instance build phase

Do not claim that `npm ci`, Vite, TypeScript, memory, disk, or CPU was definitively proven to be the root cause.

---

## Future Improvements

The current workflow is still manual. Possible later improvements include:

- CI/CD automation
- automatic commit-SHA image tags
- digest-pinned deployments
- automated smoke tests
- image lifecycle policies
- multi-stage Dockerfile
- Node runtime modernization
- credential and IAM hardening

These improvements are not implemented by this runbook.

---

## Guided production deployment script

The manual runbook above remains authoritative for understanding and troubleshooting the deployment path. For routine guided releases, the repository provides `scripts/deploy-production.sh`; it builds and tests the exact `linux/amd64` image locally and creates only a minimal Dockerrun bundle for Elastic Beanstalk.

### Authentication and local account guard

Authenticate only with the least-privileged production deployment profile:

```bash
aws sso login --profile pinboard-deployer
```

Copy the public-safe template and fill it with an independently verified AWS account ID (never commit the resulting file):

```bash
cp .pinboard-deploy.env.example .pinboard-deploy.env
# Edit PINBOARD_EXPECTED_AWS_ACCOUNT_ID=<ACCOUNT_ID>
```

The variable may instead be exported in the shell. The script fails closed without it and validates the fixed profile, `us-east-1`, account, SSO role, repository state, production health, and required resources before any write.

### Modes

A full guided preparation and deployment is:

```bash
npm run deploy:production
```

To prepare without calling `UpdateEnvironment`:

```bash
aws sso login --profile pinboard-deployer
npm run deploy:production -- --prepare-only
```

Expected checkpoints are preflight validation, an amd64 build, the exact-image local URL and `TESTED` gate, the `PREPARE` gate, ECR digest verification, minimal ZIP validation, S3 upload, EB application-version registration, and a final `PREPARED` record. This is the appropriate first live AWS validation for this script; it does **not** deploy production.

Deploy that exact prepared artifact later, from the same clean `master` commit:

```bash
npm run deploy:production -- --deploy-prepared <RELEASE_ID>
```

This verifies the local record, commit, ECR digest, S3 object, EB version, identity, and environment. It does not rebuild, locally run, push, upload, or register the artifact.

### Releases, confirmations, and records

The deterministic release is `pinboard-ecr-<short-commit-sha>`. Any collision in `.deployments`, ECR, S3, or EB stops the run. Use the prepared-release mode for an existing release, or deliberately request a timestamped identifier with `--new-release`; timestamps are never silently added.

The exact confirmation phrases are:

- `TESTED` after manually inspecting the locally running exact image;
- `PREPARE` before the first AWS write;
- `DEPLOY PINBOARD` immediately before `UpdateEnvironment`.

Non-secret atomic records are stored in the gitignored `.deployments/<RELEASE_ID>.json`. They bind the commit, image digest, environment, preparation/deployment times, result, and previous version. Do not copy credentials or `.env` contents into these records.

### Monitoring, rollback, and manual verification

Monitoring is bounded and success requires the requested version to reach `Ready / Green / Ok` with no abortable operation. HTTPS smoke checks follow redirects, reject failures, require the `Pinboard` page marker, and re-check EB state. An HTTP response alone is not considered complete production verification.

On both success and failure the script prints, but never executes, a fully scoped rollback command for the previous version. It also prints the manual checklist for homepage appearance, branding, guest browsing, pins and S3 images, login routes, Google/GitHub authentication, Twitter/X according to its documented status, and affected authenticated behavior. Use the detailed manual sections above to investigate events, logs, health checks, image issues, or to conduct rollback.
