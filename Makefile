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
	- rm -rf ${PROJECT_PATH}/testdata
	- unzip -o ${PROJECT_PATH}/testdata.zip -d ${PROJECT_PATH}
	- docker-compose ${COMPOSE_FILE} up -d
	- sleep 60

run-cypress-tests:
	-	make reset-elastic-and-cache
	- npx cypress run

run-cypress-spec-files:
	-	make reset-elastic-and-cache
	- npx cypress run --spec ${SPECS}

open-cypress-tests:
	-	make reset-elastic-and-cache
	-	./node_modules/.bin/cypress open

me-a-sandwich:
	@echo making you a choco sandwich

lint-html:
	- ./node_modules/.bin/ember-template-lint .

generate-icon-font:
	- npx icon-font-generator "./icon-font-svg-files/*.svg" \
		--out "./public/fonts" \
		--csspath "./app/styles/_icon-font.css" \
		--cssfontsurl "/fonts/" \
		--name "kaleidos-icons" \
		--htmlpath "./tmp/icons-temp.html" \
		--prefix "ki" \
		--height=1000
	- sed -i '' -e 's/\<br\>/\<br \/\>/g' "tmp/icons-temp.html"
	- sed -i '' -e 's/\<meta charset="UTF-8"\>/\<meta charset="UTF-8"\/\>/g' "tmp/icons-temp.html"
	- echo "{{!-- template-lint-disable  --}}" > "app/templates/icons.hbs" \
			&& echo "<div class=\"icons-page\">" >> "app/templates/icons.hbs" \
			&& xmllint --xpath "//body/child::*" "tmp/icons-temp.html" >> "app/templates/icons.hbs" \
			&& printf "\n</div>" >> "app/templates/icons.hbs"
	- sed -i '' -e 's/"label"\>/"label"\>ki-/g' "app/templates/icons.hbs"
