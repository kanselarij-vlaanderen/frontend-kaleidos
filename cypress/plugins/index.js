// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

//Do not convert to an ES6 module (suggested by extensions), not supported!
const { SparqlClient } = require('sparql-client-2');
const fs = require('fs-extra');
const path = require('path');

function getConfigurationByFile (file) {
  const pathToConfigFile = path.resolve('./cypress', 'config', `${file}.json`);

  return fs.readJson(pathToConfigFile)
}

module.exports = (on, config) => {
  const file = config.env.configFile || 'development';

  on('task', {
    async deleteProgress({date, time}) {
      return new SparqlClient('http://localhost:8890/sparql')
        .query(deleteQuery(date, time))
        .execute()
        .then(resp => resp.results.bindings[0][resp.head.vars[0]].value)
    }
  });

  return getConfigurationByFile(file)
};

const deleteQuery = (date, time) => `
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX session: <http://mu.semte.ch/vocabularies/session/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX dbpedia: <http://dbpedia.org/ontology/>

DELETE {
    GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
        ?meeting ?meetingP ?meetingO.
        ?agenda ?agendaP ?agendaO.
    }
} WHERE {
    GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {

            ?meeting a besluit:Zitting ;
                ?meetingP ?meetingO.

            ?agenda besluit:isAangemaaktVoor ?meeting ;
                ext:aangemaaktOp ?created;
                ?agendaP ?agendaO.
            FILTER(str(?created) >= "${date}")
    }
}

DELETE {
    GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
        ?case ?caseP ?caseO.
        ?subcase ?subcaseP ?subcaseO.
    }
} WHERE {
    GRAPH <http://mu.semte.ch/graphs/organizations/kanselarij> {
            ?case a dbpedia:Case ;
                dct:created ?created ;
                ?caseP ?caseO.

            OPTIONAL {
                ?case dct:hasPart ?subcase ;
                    ?subcaseP ?subcaseO.
            }
            FILTER(str(?created) > "${time}")
    }
}`;
