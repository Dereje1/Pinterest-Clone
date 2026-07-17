#!/usr/bin/env bash
set -Eeuo pipefail

readonly SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly DEPLOY_SCRIPT="$SCRIPT_DIR/deploy-production.sh"

pass() { printf 'PASS: %s\n' "$1"; }
fail() { printf 'FAIL: %s\n' "$1" >&2; exit 1; }

test_deploy_prepared_skips_build_preflight() (
  source "$DEPLOY_SCRIPT"
  common_tools_preflight() { :; }
  common_repo_preflight() { FULL_SHA=abc; SHORT_SHA=abc; }
  build_tools_preflight() { fail 'deploy-prepared invoked Docker/tool preflight'; }
  build_repo_preflight() { fail 'deploy-prepared invoked .env preflight'; }
  load_account() { :; }
  aws_preflight() { :; }
  load_prepared() { :; }
  deploy() { :; }
  main --deploy-prepared pinboard-ecr-abc
)

test_transitional_health_continues() (
  source "$DEPLOY_SCRIPT"
  RELEASE_ID=pinboard-ecr-abc
  MONITOR_TIMEOUT_SECONDS=5; MONITOR_POLL_SECONDS=0
  local counter; counter=$(mktemp); echo 0 >"$counter"
  environment_state() {
    local n; n=$(cat "$counter"); n=$((n+1)); echo "$n" >"$counter"
    if ((n == 1)); then printf 'Ready\tYellow\tWarning\t%s\tFalse\n' "$RELEASE_ID"
    else printf 'Ready\tGreen\tOk\t%s\tFalse\n' "$RELEASE_ID"; fi
  }
  events() { :; }
  monitor
  [[ "$(cat "$counter")" == 2 ]] || fail 'transitional Ready state did not continue polling'
  rm -f "$counter"
)

test_unexpected_ready_version_fails() (
  source "$DEPLOY_SCRIPT"
  RELEASE_ID=pinboard-ecr-abc; MONITOR_TIMEOUT_SECONDS=2; MONITOR_POLL_SECONDS=0
  environment_state() { printf 'Ready\tGreen\tOk\tprevious-version\tFalse\n'; }
  events() { :; }
  monitor
)

test_etag_mismatch_fails() (
  source "$DEPLOY_SCRIPT"
  BUNDLE_BUCKET=bucket; BUNDLE_KEY=pinboard/release.zip; BUNDLE_ETAG=expected
  aws_cli() { printf '"changed"\n'; }
  verify_prepared_bundle
)

test_eb_source_mismatch_fails() (
  source "$DEPLOY_SCRIPT"
  BUNDLE_BUCKET=bucket; BUNDLE_KEY=pinboard/release.zip; BUNDLE_ETAG=expected; RELEASE_ID=release
  aws_cli() {
    if [[ "$1" == s3api ]]; then printf '"expected"\n'; else printf 'other-bucket\twrong.zip\n'; fi
  }
  verify_prepared_bundle
)

test_deploy_prepared_skips_build_preflight; pass 'deploy-prepared skips Docker and .env checks'
test_transitional_health_continues; pass 'Ready expected release waits for health'
if test_unexpected_ready_version_fails; then fail 'unexpected Ready version was accepted'; else pass 'Ready unexpected release fails'; fi
if test_etag_mismatch_fails; then fail 'changed S3 ETag was accepted'; else pass 'S3 ETag mismatch fails'; fi
if test_eb_source_mismatch_fails; then fail 'unexpected EB source bundle was accepted'; else pass 'EB source bundle mismatch fails'; fi
