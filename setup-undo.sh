#!/bin/bash

#brew uninstall encoredev/tap/encore
#brew uninstall mkcert
#brew uninstall nss # if you use Firefox

ENV_FILE="${PWD}/.env"

if [ ! -f .env ]; then
     echo ".env doesnt exists"
     exit 1
fi

# Load environment variables from .env
set -a # automatically export all variables
source $ENV_FILE
set +a

SSL_CERT="${PWD}/infra/docker/ingress/ssl/_wildcard.${DOMAIN}.pem"
SSL_SECRET="${PWD}/infra/docker/ingress/ssl/_wildcard.${DOMAIN}-key.pem"

if [ -f $SSL_CERT ]; then
    rm $SSL_CERT
    echo "_wildcard.${DOMAIN}.pem file removed"
fi

if [ -f $SSL_SECRET ]; then
    rm $SSL_SECRET
    echo "_wildcard.${DOMAIN}-key.pem file removed"
fi

if [ $DOMAIN ]; then
      ./scripts/remove-etc-hosts-entry.sh "traefik.${DOMAIN}"
      ./scripts/remove-etc-hosts-entry.sh "whoami.${DOMAIN}"
      ./scripts/remove-etc-hosts-entry.sh "pgweb.${DOMAIN}"
      ./scripts/remove-etc-hosts-entry.sh "logto.${DOMAIN}"
      ./scripts/remove-etc-hosts-entry.sh "admin.${DOMAIN}"
      ./scripts/remove-etc-hosts-entry.sh "api.${DOMAIN}"
else
    echo ".env doesnt contain DOMAIN"
    exit 1
fi

if ( [ $APP_NAME ] && [ $DOMAIN ] ) ; then
    ./scripts/remove-etc-hosts-entry.sh "${APP_NAME}.${DOMAIN}"
else
    echo ".env doesnt contain APP_NAME && DOMAIN"
    exit 1
fi
