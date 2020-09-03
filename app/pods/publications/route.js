import Route from '@ember/routing/route';
import moment from 'moment';

export default class PublicationsRoute extends Route {
  mockedPublications = [
    {
      case: 35222,
      isDone: false,
      noInternalOVRBReference: '2020/40972',
      noBelgianOfficialGazette: '51/24720002',
      type: 'BVR',
      dateStartPublication: moment('16/05/2020 14:32'),
      datePublicationDeadline: moment('23/05/2020'),
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
}
