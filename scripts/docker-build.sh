#!/bin/bash

COMPOSE_PROJECT_NAME=mhz19 DOCKER_SCAN_SUGGEST=false docker compose --env-file .env build
