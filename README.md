# Kanselarij Vlaanderen, frontend Kaleidos

## Prerequisites

a change
You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd fe-redpencil`
* `npm install`
* Run the precommit hook script in `scripts/pre-commit.sh` this will run the linter on all the files you are going to commit, aborting the commit if there are linter errors.

## Running / Development

* `npm start`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

## Tests

There are multiple make commands ready for you.
Check the file `Makefile` for specifics.

### Auto test Requirements
To make these tests work you will need checkout of the [project](https://github.com/kanselarij-vlaanderen/kaleidos-project) next to the frontend folder.
There you will need some customsations in your docker-compose.override.yml

```
  frontend:
    image: kanselarij/frontend-kaleidos:development
    ports:
      - 127.0.0.1:80:80
    networks:
      - default
```

### Running the full suite:
* `make run-cypress-tests-headless` will prepare the database, search and cache and run  all specs headless. This is the one you want.
* `make run-cypress-tests` will run do the same as above, only NOT headless (visible browser)

### Running a specific test:
 * `make open-cypress-tests` will prepare the database and open the visual spec selector for you.
 * `make run-cypress-spec-files` will prepare all DB search and cache and run the specified spec files.

### Preparation of the Data:

These commands are used in the above commands. you only need them if you want to reset the DB in between tests or ad hoc.
 * `make reset-cache-resource-only` will only reset the resource and cache.
 * `make reset-cache` will reset the database and cache .
 * `make reset-elastic-and-cache` will reset the database and cache.
 
### End to end steps to run the tests:
1. In the project run `docker-compose up -d` make sure every service is up and running.
2. Make sure your frontend is running on port 4200 also. Issueing the command `npm start` in the frontend should do the trick.
3. Also in the frontend: issue the  `make run-cypress-tests-headless` command. Your tests are now running.
