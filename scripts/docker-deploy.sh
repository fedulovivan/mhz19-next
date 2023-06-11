#!/bin/bash

COMPOSE_PROJECT_NAME=mhz19 docker compose --env-file .env up --no-build --remove-orphans zigbee2mqtt
