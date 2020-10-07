#!/bin/bash

echo "Usage: log-count -s service -f from -u until -m match -p project"

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -s|--service)
    SERVICE="$2"
    shift # past argument
    shift # past value
    ;;
    -f|--from)
    FROM="$2"
    shift # past argument
    shift # past value
    ;;
    -u|--until)
    UNTIL="$2"
    shift # past argument
    shift # past value
    ;;
    -m|--match)
    MATCH="$2"
    shift # past argument
    shift # past value
    ;;
    -p|--project)
    PROJECT="$2"
    shift # past argument
    shift # past val
    ;;
esac
done
 
CONTAINER_ID=`docker ps --filter "label=com.docker.compose.project=$PROJECT" --filter "label=com.docker.compose.service=$SERVICE" --format "{{.Names}}"`

echo `docker logs $CONTAINER_ID --since $FROM --until $UNTIL 2>/dev/null | grep -c "$MATCH"`
