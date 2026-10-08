#!/usr/bin/env bash
set -euo pipefail
cd /workspace/SintedoRP
node -e 'if (Number(process.versions.node.split(".")[0]) !== 24) throw new Error("Use Node.js 24 para este projeto")'
docker info --format '{{.ServerVersion}}' >/dev/null
npm ci --cache /workspace/.cache/npm --no-fund --no-audit
npm run services
npm run db:migrate
NEXT_TELEMETRY_DISABLED=1 npm run build
npm run typecheck
npm run test:server
