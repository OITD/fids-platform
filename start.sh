#!/bin/bash

ENV_FILE="${PWD}/.env"

# Ensure .env file exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo "Error: .env file not found at $ENV_FILE"
    exit 1
fi

# Try to get Encore auth token if not in .env
if ! grep -v '^PATH=' "$ENV_FILE" | grep -q "ENCORE_AUTH_TOKEN"; then
    echo "Error: .env file not found at $ENV_FILE"
    exit 1
fi

# Load environment variables **but excluding hosts PATH configuration**
set -a
export "$(grep -v '^PATH=' "$ENV_FILE" | xargs)"
set +a

# Export additional Docker Compose variables
export DOCKER_NETWORK=${DOCKER_NETWORK}
export COMPOSE_PROJECT_NAME=${COMPOSE_NAME}

# Create external network proxy if it doesn't exist
docker network create \
  --driver=bridge \
  --attachable \
  --internal=false \
  proxy \
|| echo "Network proxy already exists"

# Start the main compose services
docker compose \
--env-file "$ENV_FILE" \
--project-name "${COMPOSE_NAME}" \
-f "./compose.proxy.yml" \
-f "./infra/docker/ingress/compose.override.yml" \
-f "./infra/docker/db/compose.override.yml" \
-f "./infra/docker/logto/compose.override.yml" \
up -d --build --force-recreate --renew-anon-volumes \
|| exit

# Load environment variables from .env
set -a # automatically export all variables
source $ENV_FILE
set +a

# Function to set encore-dev local a secret if the environment variable exists
set_secret() {
    local secret_name=$1
    local env_value=${!secret_name}

    if [ -n "$env_value" ]; then
        echo "Setting secret: $secret_name"
        encore secret set --type dev,preview,local "$secret_name" <<< "$env_value"
    else
        echo "Warning: $secret_name not found in .env"
    fi
}

# List of secrets to set
secrets=(
    "DOMAIN"
    "PORT"
    "NODE_ENV"
    "APP_NAME"
    "APP_URI"
    "APP_URL"
    "HMR_PORT"
    "LOGTO_URL"
    "LOGTO_APP_ID"
    "LOGTO_APP_SECRET"
    "LOGTO_APP_API_RESOURCE"
    "LOGTO_MANAGEMENT_API_RESOURCE"
    "LOGTO_MANAGEMENT_API_APPLICATION_ID"
    "LOGTO_MANAGEMENT_API_APPLICATION_SECRET"
)

# Set each secret
for secret in "${secrets[@]}"; do
    set_secret "$secret"
done

exec encore run --debug --verbose --watch --listen 0.0.0.0:4000
