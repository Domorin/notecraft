#!/bin/bash

# source .env
# docker run --name myPostgresDb -p 5455:5432 -e POSTGRES_USER=postgresUser -e POSTGRES_PASSWORD=postgresPW -e POSTGRES_DB=postgresDB -d postgres

source .env
docker run --name $POSTGRES_NAME -p 5432:5432 -e POSTGRES_USER=$POSTGRES_USER -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -e POSTGRES_DB=$POSTGRES_DATABASE -d postgres

# set -o allexport
# source .env
# set +o allexport
# echo $POSTGRES_NAME