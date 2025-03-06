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

# Export additional Docker Compose variables
export DOCKER_NETWORK=${DOCKER_NETWORK}
export COMPOSE_PROJECT_NAME=${COMPOSE_NAME}

# Function to check if project is already running
check_containers_running() {
    # Get the output first
    local running_containers=$(docker compose ls --filter name="${COMPOSE_NAME}" --format json)

    # Check if the output is non-empty and contains actual project data
    if [ -n "$running_containers" ] && [ "$running_containers" != "[]" ]; then
        echo "Containers are running"
        return 0  # Found running containers (true)
    else
        echo "Containers are not running"
        return 1  # No running containers (false)
    fi
}

# Only proceed with Docker setup if containers aren't running
if ! check_containers_running; then
    echo "Docker containers are not running. Initiating Docker setup..."

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
else
    echo "Docker containers are already running. Skipping Docker setup..."
fi

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
    "LOGTO_URL"
    "LOGTO_APP_ID"
    "LOGTO_APP_SECRET"
    "LOGTO_APP_API_RESOURCE"
    "LOGTO_MANAGEMENT_API_RESOURCE"
    "LOGTO_MANAGEMENT_API_APPLICATION_ID"
    "LOGTO_MANAGEMENT_API_APPLICATION_SECRET"
    "LOGTO_EVENT_WEBHOOK_SIGNING_KEY"
    "STRIPE_API_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "STRIPE_SERVICE_API_KEY"
    "STRIPE_API_VERSION"
)

# Set each secret
for secret in "${secrets[@]}"; do
    set_secret "$secret"
done

exec encore run --debug --verbose --watch --listen 0.0.0.0:4000
