#!/bin/bash

# Load environment variables from the .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found. Please create one with the required STRIPE_API_KEY."
  exit 1
fi

# Check if STRIPE_API_KEY is set
if [ -z "$STRIPE_API_KEY" ]; then
  echo "STRIPE_API_KEY is not set. Please provide it in the .env file."
  exit 1
fi

curl http://localhost:4000/stripe/sync \
     -X POST \
     -d '{"object": "all", "backfillRelatedEntities": true, "gte": 1577836800}' \
     -H "Content-Type: application/json" \
     -H "x-api-key: $STRIPE_API_KEY"

