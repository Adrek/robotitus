#!/usr/bin/env bash

source .env

docker-compose -f docker-compose.prod.yml down || true

docker-compose -f docker-compose.prod.yml  up -d || true
