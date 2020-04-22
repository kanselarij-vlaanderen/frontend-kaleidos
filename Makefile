include .env.cypress
export $(shell sed 's/=.*//' .env.cypress)

reset-elastic:
	- docker-compose ${COMPOSE_FILE} kill triplestore elasticsearch musearch file cache resource
	- rm -rf ${PROJECT_PATH}/testdata
	- unzip -o ${PROJECT_PATH}/testdata.zip -d ${PROJECT_PATH}
	- docker-compose ${COMPOSE_FILE} up -d
	- sleep 60

run-cypress-tests: 
	-	make reset-elastic
	- npx cypress run

open-cypress-tests:
	-	make reset-elastic
	-	./node_modules/.bin/cypress open

me-a-sandwich:
	@echo making you a choco sandwich
