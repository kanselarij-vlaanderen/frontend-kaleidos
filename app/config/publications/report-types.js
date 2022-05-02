import CONSTANTS from 'frontend-kaleidos/config/constants';

export default [
  {
    translationKey: 'publication-reports--type--by-mandatee--on-decision-date',
    metricsTypeUri: 'by-mandatee--on-decision-date', // TODO: these aren't URI's. that should change
    fixedQueryParameters: {
      group: 'mandatee',
      // fixed query filters for this report type
      filter: {},
      // user input fields for query filters
    },
    userInputFieldsForQuery: {
      decisionDateRange: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-government-domain',
    metricsTypeUri: 'by-government-domain',
    fixedQueryParameters: {
      group: 'government-domain',
      filter: {},
    },
    userInputFieldsForQuery: {
      publicationYear: true,
      governmentDomain: true,  
    },
  },
  {
    translationKey: 'publication-reports--type--by-mandatee--only-bvr',
    metricsTypeUri: 'by-mandatee--only-bvr',
    fixedQueryParameters: {
      group: 'mandatee',
      filter: {
        regulationType: [CONSTANTS.REGULATION_TYPES.BVR],
      }
    },
    userInputFieldsForQuery: {
      publicationYear: true,
      mandatee: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-regulation-type--only-not-via-council-of-ministers',
    metricsTypeUri: 'by-regulation-type--only-not-via-council-of-ministers',
    fixedQueryParameters: {
      group: 'regulation-type',
      filter: {
        isViaCouncilOfMinisters: false,
      }
    },
    userInputFieldsForQuery: {
      publicationYear: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-regulation-type',
    metricsTypeUri: 'by-regulation-type',
    fixedQueryParameters: {
      group: 'regulation-type',
    },
    userInputFieldsForQuery: {
      publicationYear: true,
      regulationType: true,  
    },
  },
  {
    translationKey: 'publication-reports--type--by-mandatee--only-decree',
    metricsTypeUri: 'by-mandatee--only-decree',
    fixedQueryParameters: {
      group: 'mandatee',
    },
    userInputFieldsForQuery: {
      publicationYear: true,
      mandatee: true,
    },
  }
];
