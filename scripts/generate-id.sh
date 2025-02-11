#!/bin/bash

# For 20-char IDs (lowercase alphanumeric)
generate_id() {
    LC_ALL=C tr -dc 'abcdefghijklmnopqrstuvwxyz0123456789' < /dev/urandom | head -c 20
    echo
}

# For 12-char short IDs (lowercase alphanumeric)
generate_short_id() {
    LC_ALL=C tr -dc '0123456789abcdefghijklmnopqrstuvwxyz' < /dev/urandom | head -c 12
    echo
}

# For 32-char secrets (mixed case alphanumeric)
generate_secret() {
    LC_ALL=C tr -dc 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' < /dev/urandom | head -c 32
    echo
}

id=$(generate_id)
short_id=$(generate_short_id)
secret=$(generate_secret)

echo "id: ${id}"
echo "short_id: ${short_id}"
echo "secret: ${secret}"
