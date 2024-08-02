#!/bin/bash

ENV_CONFIG_FILE=.env
SQLITE_DATABASE_FILE=database.bin
MOSQUITTO_CONFIG_FILE=mosquitto.conf
MOSQUITTO_PASSWD_FILE=mosquitto.passwd

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
_check_file $MOSQUITTO_PASSWD_FILE

docker compose up --detach
