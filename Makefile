include .env.cypress
export $(shell sed 's/=.*//' .env.cypress)

reset-cache-resource-only:
	- docker-compose ${COMPOSE_FILE} kill cache resource cache-warmup
	- docker-compose ${COMPOSE_FILE} up -d cache resource cache-warmup
	- sleep 5

reset-cache:
	- docker-compose ${COMPOSE_FILE} kill yggdrasil triplestore file forever-cache cache resource migrations cache-warmup publication-report
	- rm -rf ${PROJECT_PATH}/testdata/db && rm -rf ${PROJECT_PATH}/testdata/files
	- unzip -o ${PROJECT_PATH}/testdata.zip -d ${PROJECT_PATH}
	- docker-compose ${COMPOSE_FILE} up -d
	- sleep 5

reset-elastic-and-cache:
	- docker-compose ${COMPOSE_FILE} kill yggdrasil triplestore elasticsearch search file file-bundling docx-conversion forever-cache cache resource migrations cache-warmup publication-report
	- docker-compose ${COMPOSE_FILE} rm -f yggdrasil triplestore elasticsearch search file file-bundling docx-conversion forever-cache cache resource migrations cache-warmup publication-report
	- rm -rf ${PROJECT_PATH}/testdata
	- rm -rf ${PROJECT_PATH}/testdata-elasticsearch
	- unzip -o ${PROJECT_PATH}/testdata.zip -d ${PROJECT_PATH}
	- unzip -o ${PROJECT_PATH}/testdata-elasticsearch.zip -d ${PROJECT_PATH}
	- mv ${PROJECT_PATH}/testdata-elasticsearch/* ${PROJECT_PATH}/testdata
	- rm -rf ${PROJECT_PATH}/testdata-elasticsearch
	- docker-compose ${COMPOSE_FILE} up -d
	- sleep 120

run-cypress-tests:
	-	make reset-elastic-and-cache
	- npx cypress run

run-cypress-tests-headless:
	-	make reset-elastic-and-cache
	- npx cypress run --headless

run-cypress-spec-files:
	-	make reset-elastic-and-cache
	- npx cypress run --spec ${SPECS}

open-cypress-tests:
	-	make reset-elastic-and-cache
	-	./node_modules/.bin/cypress open

open-npx-cypress-tests:
	-	make reset-elastic-and-cache
	-	npx cypress open

me-a-sandwich:
	@echo making you a choco sandwich

lint-html:
	- ./node_modules/.bin/ember-template-lint .

drc-up-d:
	- docker-compose ${COMPOSE_FILE} up -d

drc-kill:
	- docker-compose ${COMPOSE_FILE} kill && docker-compose ${COMPOSE_FILE} rm -f
