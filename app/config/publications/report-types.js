import CONSTANTS from 'frontend-kaleidos/config/constants';

export default [
  {
    translationKey: 'publication-reports--type--by-mandatee--on-decision-date',
    metricsTypeUri: 'by-mandatee--on-decision-date', // TODO: these aren't URI's. that should change
    // fixed job params for this report type
    fixedParams: {
      query: {
        group: 'mandatee',
        filter: {},
      },
    },
    // user input fields for job param filters in modal for this report type
    userInputFieldsForParams: {
      decisionDateRange: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-government-domain',
    metricsTypeUri: 'by-government-domain',
    fixedParams: {
      query: {
        group: 'government-domain',
        filter: {},
      }
    },
    userInputFieldsForParams: {
      publicationYear: true,
      governmentDomain: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-mandatee--only-bvr',
    metricsTypeUri: 'by-mandatee--only-bvr',
    fixedParams: {
      query: {
        group: 'mandatee',
        filter: {
          regulationType: [CONSTANTS.REGULATION_TYPES.BVR],
        }
      }
    },
    userInputFieldsForParams: {
      publicationYear: true,
      mandatee: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-regulation-type--only-not-via-council-of-ministers',
    metricsTypeUri: 'by-regulation-type--only-not-via-council-of-ministers',
    fixedParams: {
      query: {
        group: 'regulation-type',
        filter: {
          isViaCouncilOfMinisters: false,
        }
      }
    },
    userInputFieldsForParams: {
      publicationYear: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-regulation-type',
    metricsTypeUri: 'by-regulation-type',
    fixedParams: {
      query: {
        group: 'regulation-type',
      }
    },
    userInputFieldsForParams: {
      publicationYear: true,
      regulationType: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-mandatee--only-decree',
    metricsTypeUri: 'by-mandatee--only-decree',
    fixedParams: {
      query: {
        group: 'mandatee',
      }
    },
    userInputFieldsForParams: {
      publicationYear: true,
      mandatee: true,
    },
  }
];
