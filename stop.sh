#!/bin/bash

ENV_FILE="${PWD}/.env"

# Ensure .env file exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo "Error: .env file not found at $ENV_FILE"
    exit 1
fi

# Load environment variables from .env
set -a # automatically export all variables
source $ENV_FILE
set +a

docker compose \
--env-file "$ENV_FILE" \
-f "./compose.proxy.yml" \
-f "./infra/docker/ingress/compose.override.yml" \
-f "./infra/docker/db/compose.override.yml" \
-f "./infra/docker/logto/compose.override.yml" \
down --volumes --remove-orphans -t 1 \
|| exit

# Destroy proxy network
docker network rm proxy || echo "Done"
