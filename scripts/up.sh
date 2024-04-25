#!/bin/bash

SQLITE_DATABASE_FILE=database.bin
ENV_CONFIG_FILE=.env

if [ ! -f "$SQLITE_DATABASE_FILE" ]; then
    echo "File $SQLITE_DATABASE_FILE is missing" >&2
    exit 1
fi

if [ ! -f "$ENV_CONFIG_FILE" ]; then
    echo "File $ENV_CONFIG_FILE is missing" >&2
    exit 1
fi

docker compose up --no-build --detach
