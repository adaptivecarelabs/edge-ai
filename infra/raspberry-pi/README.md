# Raspberry Pi edge-server image

Provisioning target: Raspberry Pi 4 (4GB RAM, 32GB SD), Ubuntu 22.04 LTS (arm64), Docker.

## Current status: Docker simulation (no Pi hardware yet)

Until a physical Pi 4 is available, `docker-compose.rpi-sim.yml` stands in for it: an overlay
on the root `docker-compose.yml` that runs the same edge-server/CouchDB/Redis stack under
`linux/arm64` (matching the Pi's arch) with memory/CPU ceilings approximating a 4GB Pi 4, and
`restart: unless-stopped` in place of the real image's service auto-start.

Verified end-to-end on an Intel Mac via QEMU emulation: all three containers run genuine
`aarch64` binaries (confirmed with `uname -m` inside each), the memory/CPU/restart settings
are applied, and the smoke test passes.

Run it:

```bash
# one-time, only needed on a non-arm64 host (e.g. Intel Mac/Linux) to emulate arm64
docker run --privileged --rm tonistiigi/binfmt --install arm64

docker compose -f docker-compose.yml -f infra/raspberry-pi/docker-compose.rpi-sim.yml up -d --build
infra/raspberry-pi/smoke-test.sh
```

The smoke test waits for the edge-server to come up, hits `/health` and `/version`, provisions
and verifies the CouchDB databases, and pings Redis — the same checks the real Pi image will
need to pass.

**Known gotcha:** on Docker Desktop, QEMU-emulated (non-native-arch) build containers can lose
access to the internal DNS proxy, breaking `pip install`/`apt` mid-build with resolution errors
even though `docker pull` works fine. `docker-compose.rpi-sim.yml` works around this with
`build.network: host` on the edge-server service (routes build-time network through the host's
resolver instead). Expect the arm64 build to be much slower than a native build — QEMU-emulated
`pip install` took ~20 minutes on an Intel Mac vs. seconds natively; this is emulation overhead,
not something worth optimizing away.

**What this simulation does *not* cover:** real Pi 4 CPU (Cortex-A72) performance, SD-card I/O,
thermal throttling, or the actual boot/provisioning path onto Ubuntu 22.04. Those need the real
device and remain open — this only de-risks the container/service config ahead of hardware
arriving, so Phase 1 governance/infra work isn't blocked on procurement.

## Still needed once a Pi is available

A provisioning script/image (Ansible or shell) that installs Docker on Ubuntu 22.04 and brings
up this same stack on first boot, per the DoD in `docs/project_plan.md`: boots on target RPi
4/4GB, services auto-start, smoke test passes.
