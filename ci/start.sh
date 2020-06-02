#!/bin/bash

cp Dockerfile.test Dockerfile;
cp ./ci/docker-compose.override.yml ./kaleidos-project/docker-compose.override.yml;
cd ./kaleidos-project
mkdir data && chmod 777 data
export HOST_UID_GID=$(id -u):$(id -g)
docker-compose -p ${projectName} up -d
docker-compose -p ${projectName}  exec -T triplestore chmod -R 777 /data
docker-compose -p ${projectName}  exec -T musearch chmod -R 777 /data
docker-compose -p ${projectName}  exec -T musearch chmod -R 777 /data
docker-compose -p ${projectName}  exec -T file-bundling-service chmod -R 777 /share
cd ..
cp cypress.test.json cypress.json
cp ./ci/package.* ./
cp ${WORKSPACE}/ci/.env.cypress ${WORKSPACE}/.env.cypress
npm i --production

docker-compose -p ${projectName} exec -T elasticsearch chmod -R 777 /usr/share/elasticsearch/data
docker-compose -p ${projectName} kill triplestore elasticsearch musearch file cache resource
rm -rf testdata
unzip -o testdata.zip -d ${WORKSPACE}/kaleidos-project
rm -rf data/*
mv testdata/* data
docker-compose -p ${projectName} up -d
sleep 60
