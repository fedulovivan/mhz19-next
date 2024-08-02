#!/bin/bash

ENV_CONFIG_FILE=.env
SQLITE_DATABASE_FILE=database.bin
MOSQUITTO_CONFIG_FILE=mosquitto.conf

function _check_file {
    FILE=$1
    if [ ! -f "$FILE" ]; then
        echo "File $FILE is missing" >&2
        exit 1
    fi
}

_check_file $SQLITE_DATABASE_FILE
_check_file $ENV_CONFIG_FILE
_check_file $MOSQUITTO_CONFIG_FILE

docker compose --env-file $ENV_CONFIG_FILE up --detach
