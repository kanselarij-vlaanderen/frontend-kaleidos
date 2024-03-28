include .env.cypress
export $(shell sed 's/=.*//' .env.cypress)

reset-cache-resource-only:
	- docker-compose ${COMPOSE_FILE} kill cache resource cache-warmup forever-cache
	- docker-compose ${COMPOSE_FILE} up -d cache resource forever-cache
	- sleep 10
	- docker-compose ${COMPOSE_FILE} up -d cache-warmup
	- sleep 5

reset-cache:
	- docker-compose ${COMPOSE_FILE} kill yggdrasil triplestore file cache resource migrations cache-warmup publication-report decision-report-generation vlaams-parlement-sync
	- rm -rf ${PROJECT_PATH}/testdata/db && rm -rf ${PROJECT_PATH}/testdata/files
	- unzip -o ${PROJECT_PATH}/testdata.zip -d ${PROJECT_PATH}
	- docker-compose ${COMPOSE_FILE} up -d triplestore migrations database cache forever-cache
	-	sleep 20
	- docker-compose ${COMPOSE_FILE} up -d
	- sleep 5

reset-elastic-and-cache:
	- docker-compose ${COMPOSE_FILE} kill yggdrasil triplestore elasticsearch search file file-bundling docx-conversion forever-cache cache resource migrations cache-warmup publication-report decision-report-generation vlaams-parlement-sync
	- docker-compose ${COMPOSE_FILE} rm -f yggdrasil triplestore elasticsearch search file file-bundling docx-conversion forever-cache cache resource migrations cache-warmup publication-report decision-report-generation vlaams-parlement-sync
	- rm -rf ${PROJECT_PATH}/testdata
	- rm -rf ${PROJECT_PATH}/testdata-elasticsearch
	- unzip -o ${PROJECT_PATH}/testdata.zip -d ${PROJECT_PATH}
	- unzip -o ${PROJECT_PATH}/testdata-elasticsearch.zip -d ${PROJECT_PATH}
	- mv ${PROJECT_PATH}/testdata-elasticsearch/* ${PROJECT_PATH}/testdata
	- rm -rf ${PROJECT_PATH}/testdata-elasticsearch
	- docker-compose ${COMPOSE_FILE} up -d triplestore migrations database cache forever-cache
	-	sleep 20
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

run-cypress-spec-files-no-reset:
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
	- docker-compose ${COMPOSE_FILE} up -d triplestore migrations database cache forever-cache
	-	sleep 20
	- docker-compose ${COMPOSE_FILE} up -d

drc-kill:
	- docker-compose ${COMPOSE_FILE} kill && docker-compose ${COMPOSE_FILE} rm -f

drc-up-d-service:
	- docker-compose ${COMPOSE_FILE} up -d ${SERV}

drc-restart-service:
	- docker-compose ${COMPOSE_FILE} restart ${SERV}

drc:
	- docker-compose ${COMPOSE_FILE} ${args}

new-zip-run-migrations:
# start with a clean DB (no tests run yet / reset before test)
# optional, make a backup of current zips (or discard changes if final zips are wrong)
	- make drc-kill
	- rm -rf ${PROJECT_PATH}/testdata
	- rm -rf ${PROJECT_PATH}/testdata-elasticsearch
	- unzip -o ${PROJECT_PATH}/testdata.zip -d ${PROJECT_PATH}
	- unzip -o ${PROJECT_PATH}/testdata-elasticsearch.zip -d ${PROJECT_PATH}
	- mv ${PROJECT_PATH}/testdata-elasticsearch/* ${PROJECT_PATH}/testdata
	- rm -rf ${PROJECT_PATH}/testdata-elasticsearch
	- docker-compose ${COMPOSE_FILE} up -d triplestore migrations && docker-compose ${COMPOSE_FILE} logs -f migrations
# instead of backup up the zips you could rename the current ones after this step
# wait till migrations are done

new-zip-run-yggdrasil:
# make sure the yggdrasil env flags are enabled => USE_DIRECT_QUERIES: "yes" / RELOAD_ON_INIT: "true"
# manually remove all 3 graphs via sparql
# DROP SILENT GRAPH <http://mu.semte.ch/graphs/organizations/intern-regering>
# DROP SILENT GRAPH <http://mu.semte.ch/graphs/organizations/intern-overheid>
# DROP SILENT GRAPH <http://mu.semte.ch/graphs/organizations/minister>
	-	docker-compose ${COMPOSE_FILE} up -d database
	- docker-compose ${COMPOSE_FILE} up -d yggdrasil && docker-compose ${COMPOSE_FILE} logs -f yggdrasil
# wait for yggdrasil to complete, remove the flags and docker-compose kill yggdrasil.

new-zip-run-reindex:
# run ./scripts/reset-elastic-test.sh in the project folder
	- docker-compose ${COMPOSE_FILE} logs -f search
# wait for search reindex to complete
# testdata folder should now contain new index and new database.
# put the elasticsearch folder in a folder named "testdata-elasticsearch" and zip it
# keep the other folders in the testdata folder and zip the "testdata" folder.
# these 2 should be the new zips
# run make reset-elastic-and-cache and verify
# testdata.zip contains folder named "testdata" with subfolders "db", "files", "tika"
# testdata-elasticsearch.zip contains folder named "testdata-elasticsearch" with subfolder "elasticsearch"
