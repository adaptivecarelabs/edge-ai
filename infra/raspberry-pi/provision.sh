#!/usr/bin/env bash
# Provisions a Raspberry Pi 4 (4GB, Ubuntu 22.04 LTS arm64) as an Edge-AI edge-server.
# Run this ON the Pi (e.g. over SSH), from a checkout of this repo.
# Usage: sudo ./infra/raspberry-pi/provision.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root (sudo)." >&2
  exit 1
fi

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET_USER="${SUDO_USER:-root}"

if [ ! -f "${REPO_DIR}/docker-compose.yml" ]; then
  echo "FAIL: ${REPO_DIR}/docker-compose.yml not found — run this from a checkout of the repo." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "==> Installing curl"
  apt-get update -y
  apt-get install -y curl
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker"
  curl -fsSL https://get.docker.com | sh
else
  echo "==> Docker already installed ($(docker --version))"
fi

echo "==> Enabling Docker service"
systemctl enable --now docker

if [ "$TARGET_USER" != "root" ] && ! id -nG "$TARGET_USER" | grep -qw docker; then
  echo "==> Adding ${TARGET_USER} to the docker group"
  usermod -aG docker "$TARGET_USER"
  echo "    (log out/in for group membership to take effect)"
fi

echo "==> Building and starting the stack"
cd "$REPO_DIR"
docker compose -f docker-compose.yml -f infra/raspberry-pi/docker-compose.rpi-sim.yml up -d --build

echo "==> Running smoke test"
infra/raspberry-pi/smoke-test.sh

echo "==> Provisioning complete."
echo "    Services restart automatically with the Docker daemon (restart: unless-stopped),"
echo "    so they come back up on reboot as long as 'docker compose down' is never run."
