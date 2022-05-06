import CONSTANTS from 'frontend-kaleidos/config/constants';

export default [
  {
    translationKey: 'publication-reports--type--by-mandatee--on-decision-date',
    metricsTypeUri: 'by-mandatee--on-decision-date', // TODO: these aren't URI's. that should change
    // fixed job params for this report type
    // TODO: should be set on the backend
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
    translationKey: 'publication-reports--type--by-government-domain',
    metricsTypeUri: 'by-government-domain',
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
    translationKey: 'publication-reports--type--by-mandatee--only-bvr',
    metricsTypeUri: 'by-mandatee--only-bvr',
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
    translationKey:
      'publication-reports--type--by-regulation-type--only-not-via-council-of-ministers',
    metricsTypeUri: 'by-regulation-type--only-not-via-council-of-ministers',
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
    translationKey: 'publication-reports--type--by-regulation-type',
    metricsTypeUri: 'by-regulation-type',
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
    translationKey: 'publication-reports--type--by-mandatee--only-decree',
    metricsTypeUri: 'by-mandatee--only-decree',
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
