#!/bin/bash

SERVICE=${1:-backend}

docker exec --interactive --tty "mhz19-next-$SERVICE-1" /bin/sh
