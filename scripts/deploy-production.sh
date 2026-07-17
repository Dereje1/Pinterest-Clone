#!/usr/bin/env bash
set -Eeuo pipefail

readonly PROFILE=pinboard-deployer REGION=us-east-1 APPLICATION=Pinterest-Clone
readonly ENVIRONMENT=Pinterest-Clone-new-env REPOSITORY=pinboard
readonly URL=https://pclone.derejegetahun.com LOCAL_URL=http://localhost:3001/
MODE=full; NEW_RELEASE=false; PREPARED_RELEASE=""; CONTAINER_ID=""; TEMP_DIR=""; DEPLOYMENT_STARTED=false
CALLER_ARN=""; ACCOUNT_ID=""; FULL_SHA=""; SHORT_SHA=""; RELEASE_ID=""; ECR_URI=""
IMAGE_DIGEST=""; PREVIOUS_VERSION=""; PREPARED_AT=""

usage() { cat <<'EOF'
Usage:
  npm run deploy:production
  npm run deploy:production -- --prepare-only
  npm run deploy:production -- --deploy-prepared <RELEASE_ID>
  npm run deploy:production -- --new-release
  npm run deploy:production -- --help

Guided Pinboard production preparation and deployment. --new-release
deliberately adds a UTC timestamp if the commit release already exists.
EOF
}
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
log() { printf '[%s] %s\n' "$(date -u +%FT%TZ)" "$*"; }
aws_cli() { aws "$@" --region "$REGION" --profile "$PROFILE"; }
cleanup() {
  local s=$?
  [[ -z "$CONTAINER_ID" ]] || docker rm -f "$CONTAINER_ID" >/dev/null 2>&1 || true
  [[ -z "$TEMP_DIR" ]] || rm -rf "$TEMP_DIR"
  if [[ "$DEPLOYMENT_STARTED" == true ]]; then
    ((s == 0)) || write_record FAILED
    rollback
  fi
  exit "$s"
}
trap cleanup EXIT INT TERM
confirm() { local answer; printf 'Type %s to continue: ' "$1"; IFS= read -r answer || die 'confirmation input ended'; [[ "$answer" == "$1" ]] || die "confirmation did not exactly match $1"; }

parse_args() {
  while (($#)); do case "$1" in
    --prepare-only) [[ "$MODE" == full ]] || die 'modes cannot be combined'; MODE=prepare-only ;;
    --deploy-prepared) [[ "$MODE" == full && -n "${2:-}" ]] || die '--deploy-prepared requires a release'; MODE=deploy-prepared; PREPARED_RELEASE=$2; shift ;;
    --new-release) NEW_RELEASE=true ;;
    --help|-h) usage; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac; shift; done
  [[ "$MODE" != deploy-prepared || "$NEW_RELEASE" == false ]] || die '--new-release cannot accompany --deploy-prepared'
}

tools_preflight() {
  local t; for t in git docker aws zip unzip curl; do command -v "$t" >/dev/null || die "required tool missing: $t"; done
  docker info >/dev/null 2>&1 || die 'Docker daemon is unavailable'
  docker buildx version >/dev/null 2>&1 || die 'docker buildx is unavailable'
}
repo_preflight() {
  [[ -d .git && -f package.json && -f Dockerfile && "$(git rev-parse --show-toplevel)" == "$PWD" ]] || die 'run from the Pinterest-Clone repository root'
  [[ "$(git branch --show-current)" == master ]] || die 'production deployment requires branch master'
  [[ -z "$(git status --porcelain)" ]] || die 'working tree is dirty; commit or stash changes'
  FULL_SHA=$(git rev-parse HEAD); SHORT_SHA=$(git rev-parse --short HEAD)
  [[ -f .env ]] || die '.env is required for local testing'
  ! git ls-files --error-unmatch .env >/dev/null 2>&1 || die '.env must not be tracked'
  grep -Eq '(^|/)\.env($|[[:space:]])' .dockerignore || die '.env must be excluded by .dockerignore'
}
load_account() {
  local configured="${PINBOARD_EXPECTED_AWS_ACCOUNT_ID:-}"
  if [[ -z "$configured" && -f .pinboard-deploy.env ]]; then configured=$(sed -n 's/^PINBOARD_EXPECTED_AWS_ACCOUNT_ID=\([0-9]\{12\}\)$/\1/p' .pinboard-deploy.env); fi
  [[ "$configured" =~ ^[0-9]{12}$ ]] || die 'configure an independently verified PINBOARD_EXPECTED_AWS_ACCOUNT_ID (12 digits) in .pinboard-deploy.env or the environment'
  PINBOARD_EXPECTED_AWS_ACCOUNT_ID=$configured
}
sso_error() { printf 'AWS SSO authentication is missing or expired. Recover with:\naws sso login --profile pinboard-deployer\n' >&2; exit 1; }
environment_state() { aws_cli elasticbeanstalk describe-environments --application-name "$APPLICATION" --environment-names "$ENVIRONMENT" --query 'Environments[0].[Status,Health,HealthStatus,VersionLabel,AbortableOperationInProgress]' --output text; }
healthy_environment() {
  local state status health health_status version abortable
  state=$(environment_state); read -r status health health_status version abortable <<<"$state"
  [[ "$status" == Ready && "$health" == Green && "$health_status" == Ok && "$abortable" == False ]] || die "environment unsafe: $state"
  PREVIOUS_VERSION=$version
  curl --fail --location --silent --show-error --max-time 15 "$URL" >/dev/null || die 'production URL is not responding'
}
aws_preflight() {
  local identity configured value
  configured=$(aws configure get region --profile "$PROFILE" 2>/dev/null || true)
  [[ -z "$configured" || "$configured" == "$REGION" ]] || die "profile region is not $REGION"
  identity=$(aws_cli sts get-caller-identity --query '[Account,Arn]' --output text 2>/dev/null) || sso_error
  read -r ACCOUNT_ID CALLER_ARN <<<"$identity"
  [[ "$ACCOUNT_ID" == "$PINBOARD_EXPECTED_AWS_ACCOUNT_ID" ]] || die 'AWS account differs from independent configuration'
  [[ "$CALLER_ARN" != *:root && "$CALLER_ARN" == *AWSReservedSSO_PinboardDeployer* ]] || die 'caller must be the PinboardDeployer SSO role, not root'
  value=$(aws_cli ecr describe-repositories --repository-names "$REPOSITORY" --query 'repositories[0].repositoryName' --output text); [[ "$value" == "$REPOSITORY" ]] || die 'ECR repository missing'
  value=$(aws_cli elasticbeanstalk describe-applications --application-names "$APPLICATION" --query 'Applications[0].ApplicationName' --output text); [[ "$value" == "$APPLICATION" ]] || die 'EB application missing'
  value=$(aws_cli elasticbeanstalk describe-environments --application-name "$APPLICATION" --environment-names "$ENVIRONMENT" --query 'Environments[0].EnvironmentName' --output text); [[ "$value" == "$ENVIRONMENT" ]] || die 'EB environment missing'
  healthy_environment; ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPOSITORY"
}

release_exists() {
  local r=$1 bucket="elasticbeanstalk-$REGION-$ACCOUNT_ID" value
  [[ -e ".deployments/$r.json" ]] && return 0
  value=$(aws_cli ecr describe-images --repository-name "$REPOSITORY" --image-ids imageTag="$r" --query 'imageDetails[0].imageDigest' --output text 2>/dev/null || true); [[ -n "$value" && "$value" != None ]] && return 0
  aws_cli s3api head-object --bucket "$bucket" --key "pinboard/$r.zip" >/dev/null 2>&1 && return 0
  value=$(aws_cli elasticbeanstalk describe-application-versions --application-name "$APPLICATION" --version-labels "$r" --query 'ApplicationVersions[0].VersionLabel' --output text); [[ "$value" == "$r" ]]
}
choose_release() {
  RELEASE_ID="pinboard-ecr-$SHORT_SHA"
  if release_exists "$RELEASE_ID"; then
    [[ "$NEW_RELEASE" == true ]] || die "$RELEASE_ID exists; use --deploy-prepared $RELEASE_ID or deliberately use --new-release"
    RELEASE_ID+="-$(date -u +%Y%m%d%H%M%S)"
  fi
  ! release_exists "$RELEASE_ID" || die "release collision: $RELEASE_ID"
}
write_record() {
  local result=$1 deployed=${2:-null} record=".deployments/$RELEASE_ID.json" temp
  mkdir -p .deployments; temp="$record.tmp.$$"; [[ "$deployed" == null ]] || deployed="\"$deployed\""
  cat >"$temp" <<EOF
{
  "release": "$RELEASE_ID",
  "commit": "$FULL_SHA",
  "imageTag": "$RELEASE_ID",
  "imageDigest": "$IMAGE_DIGEST",
  "previousVersion": "$PREVIOUS_VERSION",
  "environment": "$ENVIRONMENT",
  "region": "$REGION",
  "preparedAt": "$PREPARED_AT",
  "deployedAt": $deployed,
  "result": "$result"
}
EOF
  mv "$temp" "$record"
}

build_and_test() {
  docker buildx build --platform linux/amd64 --progress=plain --load -t "pinboard:$RELEASE_ID" .
  local arch os attempt; arch=$(docker image inspect "pinboard:$RELEASE_ID" --format '{{.Architecture}}'); os=$(docker image inspect "pinboard:$RELEASE_ID" --format '{{.Os}}')
  [[ "$arch" == amd64 && "$os" == linux ]] || die "expected linux/amd64, got $os/$arch"
  CONTAINER_ID=$(docker run --rm --platform linux/amd64 -d -p 3001:3000 --env-file .env -e NODE_ENV=production -e PORT=3000 "pinboard:$RELEASE_ID")
  log "Exact image is at $LOCAL_URL"
  for attempt in {1..30}; do
    [[ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER_ID" 2>/dev/null || true)" == true ]] || { docker logs "$CONTAINER_ID" >&2 || true; die 'container exited'; }
    curl --fail --silent --max-time 5 "$LOCAL_URL" >/dev/null && break; sleep 2
  done
  curl --fail --silent --show-error --max-time 5 "$LOCAL_URL" >/dev/null || { docker logs "$CONTAINER_ID" >&2 || true; die 'local URL failed'; }
  docker logs --tail 50 "$CONTAINER_ID" || true; printf 'Inspect %s\n' "$LOCAL_URL"; confirm TESTED
  docker rm -f "$CONTAINER_ID" >/dev/null; CONTAINER_ID=""
}

prepare() {
  local bucket="elasticbeanstalk-$REGION-$ACCOUNT_ID" data bundle listing pushed size
  printf '\nPREPARATION\nCommit: %s\nRelease: %s\nECR: %s:%s\nS3: s3://%s/pinboard/%s.zip\n\n' "$FULL_SHA" "$RELEASE_ID" "$ECR_URI" "$RELEASE_ID" "$bucket" "$RELEASE_ID"
  confirm PREPARE
  ! release_exists "$RELEASE_ID" || die "release collision detected immediately before AWS writes: $RELEASE_ID"
  aws_cli ecr get-login-password | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
  docker tag "pinboard:$RELEASE_ID" "$ECR_URI:$RELEASE_ID"; docker push "$ECR_URI:$RELEASE_ID"
  data=$(aws_cli ecr describe-images --repository-name "$REPOSITORY" --image-ids imageTag="$RELEASE_ID" --query 'imageDetails[0].[imageDigest,imagePushedAt,imageSizeInBytes]' --output text)
  read -r IMAGE_DIGEST pushed size <<<"$data"; [[ "$IMAGE_DIGEST" == sha256:* ]] || die 'pushed digest unavailable'
  TEMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/$RELEASE_ID.XXXXXX")
  cat >"$TEMP_DIR/Dockerrun.aws.json" <<EOF
{
  "AWSEBDockerrunVersion": "1",
  "Image": { "Name": "$ECR_URI:$RELEASE_ID", "Update": "true" },
  "Ports": [ { "ContainerPort": "3000" } ]
}
EOF
  bundle="$TEMP_DIR/$RELEASE_ID.zip"; (cd "$TEMP_DIR" && zip -q "$RELEASE_ID.zip" Dockerrun.aws.json)
  listing=$(unzip -Z1 "$bundle"); [[ "$listing" == Dockerrun.aws.json ]] || die 'ZIP must contain exactly one root Dockerrun.aws.json'
  aws_cli s3 cp "$bundle" "s3://$bucket/pinboard/$RELEASE_ID.zip" --only-show-errors
  aws_cli elasticbeanstalk create-application-version --application-name "$APPLICATION" --version-label "$RELEASE_ID" --description "Pinboard commit $FULL_SHA; ECR digest $IMAGE_DIGEST" --source-bundle S3Bucket="$bucket",S3Key="pinboard/$RELEASE_ID.zip" >/dev/null
  [[ "$(aws_cli elasticbeanstalk describe-application-versions --application-name "$APPLICATION" --version-labels "$RELEASE_ID" --query 'ApplicationVersions[0].VersionLabel' --output text)" == "$RELEASE_ID" ]] || die 'EB version verification failed'
  PREPARED_AT=$(date -u +%FT%TZ); write_record PREPARED; log "Prepared $RELEASE_ID ($IMAGE_DIGEST, $pushed, $size bytes)"
}

record_value() { sed -n "s/^[[:space:]]*\"$2\": \"\([^\"]*\)\".*$/\1/p" "$1"; }
load_prepared() {
  [[ "$PREPARED_RELEASE" =~ ^pinboard-ecr-[a-zA-Z0-9._-]+$ ]] || die 'invalid release ID'
  RELEASE_ID=$PREPARED_RELEASE; local record=".deployments/$RELEASE_ID.json" remote bucket="elasticbeanstalk-$REGION-$ACCOUNT_ID"
  [[ -f "$record" ]] || die 'deployment record not found'
  [[ "$(record_value "$record" result)" == PREPARED ]] || die 'record is not PREPARED'
  [[ "$(record_value "$record" commit)" == "$FULL_SHA" ]] || die 'prepared commit differs from HEAD'
  IMAGE_DIGEST=$(record_value "$record" imageDigest); PREPARED_AT=$(record_value "$record" preparedAt); PREVIOUS_VERSION=$(record_value "$record" previousVersion)
  remote=$(aws_cli ecr describe-images --repository-name "$REPOSITORY" --image-ids imageTag="$RELEASE_ID" --query 'imageDetails[0].imageDigest' --output text); [[ "$remote" == "$IMAGE_DIGEST" ]] || die 'ECR digest changed'
  aws_cli s3api head-object --bucket "$bucket" --key "pinboard/$RELEASE_ID.zip" >/dev/null || die 'S3 bundle missing'
  [[ "$(aws_cli elasticbeanstalk describe-application-versions --application-name "$APPLICATION" --version-labels "$RELEASE_ID" --query 'ApplicationVersions[0].VersionLabel' --output text)" == "$RELEASE_ID" ]] || die 'EB version missing'
}

rollback() { cat <<EOF
Rollback command (not executed):
aws elasticbeanstalk update-environment \\
  --application-name Pinterest-Clone \\
  --environment-name Pinterest-Clone-new-env \\
  --version-label $PREVIOUS_VERSION \\
  --region us-east-1 \\
  --profile pinboard-deployer
EOF
}
events() { aws_cli elasticbeanstalk describe-events --environment-name "$ENVIRONMENT" --max-records 10 --query 'Events[*].[EventDate,Severity,Message]' --output table >&2 || true; }
monitor() {
  local deadline=$((SECONDS+1800)) last="" state status health hs version abortable
  while ((SECONDS < deadline)); do
    state=$(environment_state); [[ "$state" == "$last" ]] || log "Status: $state"; last=$state
    read -r status health hs version abortable <<<"$state"
    if [[ "$status" == Ready ]]; then
      [[ "$health" == Green && "$hs" == Ok && "$version" == "$RELEASE_ID" && "$abortable" == False ]] && return 0
      events; die "deployment returned Ready without expected healthy release $RELEASE_ID"
    fi
    sleep 20
  done
  events; die "deployment timed out; expected $RELEASE_ID (inspect: aws elasticbeanstalk request-environment-info --info-type tail --environment-name $ENVIRONMENT --region $REGION --profile $PROFILE)"
}
smoke() {
  local body state attempt
  for attempt in {1..12}; do body=$(curl --fail-with-body --location --silent --show-error --max-time 20 "$URL" 2>/dev/null || true); [[ "$body" == *Pinboard* ]] && break; sleep 10; done
  [[ "$body" == *Pinboard* ]] || die 'HTTPS smoke check did not find the stable Pinboard marker'
  state=$(environment_state); [[ "$state" == $'Ready\tGreen\tOk\t'"$RELEASE_ID"$'\tFalse' ]] || die "post-smoke EB state changed: $state"
}
deploy() {
  local state current_status current_health current_hs current_version abortable
  state=$(environment_state); read -r current_status current_health current_hs current_version abortable <<<"$state"; PREVIOUS_VERSION=$current_version
  cat <<EOF

PRODUCTION DEPLOYMENT

AWS profile:          $PROFILE
Caller ARN:           $CALLER_ARN
AWS account:          $ACCOUNT_ID
AWS region:           $REGION
Git commit:           $FULL_SHA
Release ID:           $RELEASE_ID
ECR tag:              $RELEASE_ID
ECR digest:           $IMAGE_DIGEST
EB application:       $APPLICATION
EB environment:       $ENVIRONMENT
Current version:      $current_version
New version:          $RELEASE_ID
Current status:       $current_status
Current health:       $current_health / $current_hs
Production URL:       responding
Rollback version:     $current_version
EOF
  confirm 'DEPLOY PINBOARD'; write_record DEPLOYING; DEPLOYMENT_STARTED=true
  aws_cli elasticbeanstalk update-environment --application-name "$APPLICATION" --environment-name "$ENVIRONMENT" --version-label "$RELEASE_ID" >/dev/null
  monitor; smoke; write_record DEPLOYED "$(date -u +%FT%TZ)"
  cat <<'EOF'
Manual verification remains required:
- homepage visual load and Pinboard branding
- guest mode, existing pins, and S3-backed images
- login routes and Google/GitHub authentication where practical
- Twitter/X only according to its documented status
- affected authenticated behavior
EOF
}

main() {
  parse_args "$@"; tools_preflight; repo_preflight; load_account; aws_preflight
  if [[ "$MODE" == deploy-prepared ]]; then load_prepared; deploy; exit; fi
  choose_release; build_and_test; prepare
  [[ "$MODE" == prepare-only ]] && { log 'Prepare-only complete; UpdateEnvironment was not called.'; exit; }
  deploy
}
main "$@"
