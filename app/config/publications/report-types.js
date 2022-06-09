import CONSTANTS from 'frontend-kaleidos/config/constants';

export default [
  {
    uri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-mandatees-on-decision-date',
    // fixed job params for this report type
    fixedParams: {
      query: {
        group: 'mandateePersons',
        filter: {},
      },
    },
    // user input fields for job param filters in modal for this report type
    userInputFields: {
      decisionDateRange: true,
    },
  },
  {
    uri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-government-domains',
    fixedParams: {
      query: {
        group: 'governmentDomains',
        filter: {},
      },
    },
    userInputFields: {
      publicationYear: true,
      governmentDomains: true,
    },
  },
  {
    uri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-mandatees-only-bvr',
    fixedParams: {
      query: {
        group: 'mandateePersons',
        filter: {
          regulationType: [CONSTANTS.REGULATION_TYPES.BVR],
        },
      },
    },
    userInputFields: {
      publicationYear: true,
      mandateePersons: true,
    },
  },
  {
    uri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-regulation-type-only-not-via-council-of-ministers',
    fixedParams: {
      query: {
        group: 'regulationType',
        filter: {
          isViaCouncilOfMinisters: false,
        },
      },
    },
    userInputFields: {
      publicationYear: true,
    },
  },
  {
    uri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-regulation-type',
    fixedParams: {
      query: {
        group: 'regulationType',
      },
    },
    userInputFields: {
      publicationYear: true,
      regulationTypes: true,
    },
  },
  {
    uri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-mandatees-only-decree',
    fixedParams: {
      query: {
        group: 'mandateePersons',
        filter: {
          regulationType: [CONSTANTS.REGULATION_TYPES.DECREET],
        },
      },
    },
    userInputFields: {
      publicationYear: true,
      mandateePersons: true,
    },
  },
];
