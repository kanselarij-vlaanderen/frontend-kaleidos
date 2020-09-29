import Route from '@ember/routing/route';
import moment from 'moment';

export default class PublicationsRoute extends Route {
  mockedPublications = [
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: false,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: false,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Brazilie',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'done',
        finished: 4,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 3,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'not-started',
        finished: 0,
        total: 4,
      },
    },
    {
      case: 'Luchtvervoersovereenkomst Senegal',
      inProgress: true,
      noInternalOVRBReference: '35222',
      noBelgianOfficialGazette: null,
      type: 'BVR',
      dateStartPublication: moment().format('DD/MM/YYYY'),
      datePublicationDeadline: moment()
        .add(5, 'days')
        .format('DD/MM/YYY'),
      translationStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 2,
        total: 4,
      },
      signatureStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 2,
        total: 4,
      },
      printProofStatus: {
        initiated: true,
        status: 'in-progress',
        finished: 2,
        total: 4,
      },
    }
  ];

  model() {
    // Normally we would query store here, but for now, we get the mocks

    return this.mockedPublications;
  }

  redirect() {
    return this.transitionTo('publications.in-progress');
  }
}
