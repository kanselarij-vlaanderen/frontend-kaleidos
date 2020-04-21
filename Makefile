include .env.cypress
export $(shell sed 's/=.*//' .env.cypress)

run-cypress-tests-after-reset-elastic:
	- docker-compose ${COMPOSE_FILE} kill triplestore elasticsearch musearch file cache resource
	- rm -rf ${PROJECT_PATH}/testdata
	- unzip -o ${PROJECT_PATH}/testdata.zip -d ${PROJECT_PATH}
	- docker-compose ${COMPOSE_FILE} up -d
	- sleep 60
	- npx cypress run --spec cypress/integration/unit/click-table.spec.js
