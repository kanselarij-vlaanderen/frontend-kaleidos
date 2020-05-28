include .env.cypress
export $(shell sed 's/=.*//' .env.cypress)

reset-cache:
	- docker-compose ${COMPOSE_FILE} kill triplestore file cache resource
	- rm -rf ${PROJECT_PATH}/testdata/db && rm -rf ${PROJECT_PATH}/testdata/files
	- unzip -o ${PROJECT_PATH}/testdata.zip -x "elasticsearch/*" -d ${PROJECT_PATH}
	- docker-compose ${COMPOSE_FILE} up -d
	- sleep 5

reset-elastic-and-cache:
	- docker-compose ${COMPOSE_FILE} kill triplestore elasticsearch musearch file cache resource
	- docker-compose ${COMPOSE_FILE} rm -f triplestore elasticsearch musearch file cache resource
	- rm -rf ${PROJECT_PATH}/testdata
	- unzip -o ${PROJECT_PATH}/testdata.zip -d ${PROJECT_PATH}
	- docker-compose ${COMPOSE_FILE} up -d
	- sleep 60

run-cypress-tests:
	- make reset-elastic-and-cache
	- npx cypress run

run-cypress-tests-headless:
	-	make reset-elastic-and-cache
	- npx cypress run --headless

run-cypress-spec-files:
	- make reset-elastic-and-cache
	- npx cypress run --spec ${SPECS}

open-cypress-tests:
	- make reset-elastic-and-cache
	- ./node_modules/.bin/cypress open

me-a-sandwich:
	@echo making you a choco sandwich

lint-html:
	- ./node_modules/.bin/ember-template-lint .

icon-font:
	- ./generate-icon-font.sh
