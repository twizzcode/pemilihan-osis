#!/usr/bin/env bash
#
# Build the Pilkasis image and push it to Docker Hub.
#
# Usage:
#   scripts/docker-push.sh                # tags: latest + <git-sha>
#   DOCKER_IMAGE=me/app scripts/docker-push.sh
#
# Login first if the Docker Hub repo is private:
#   docker login
#
set -euo pipefail

IMAGE="${DOCKER_IMAGE:-twizzcode/pemilihan-osis}"
SHA="$(git rev-parse --short HEAD 2>/dev/null || echo nogit)"
LATEST_TAG="${IMAGE}:latest"
SHA_TAG="${IMAGE}:${SHA}"

echo "==> Building ${LATEST_TAG} (also tagging ${SHA_TAG})"
docker build \
  --tag "${LATEST_TAG}" \
  --tag "${SHA_TAG}" \
  .

echo "==> Pushing ${LATEST_TAG}"
docker push "${LATEST_TAG}"

echo "==> Pushing ${SHA_TAG}"
docker push "${SHA_TAG}"

echo "==> Done."
echo "   Deploy on the VPS with:  docker compose pull && docker compose up -d"
echo "   Pin to this build with:  IMAGE_TAG=${SHA} docker compose up -d"
