/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default class PublicationService extends Service {
  @service store;
  @service toaster;
  @service intl;

  async createNewPublication(publicationNumber, _caseId, title, shortTitle) {
    // Work with the case.
    // Test if dossier already had publication (index not up to date).
    // For people that dont refresh and we're in a SPA.
    const pubFlows = await this.store.query('publication-flow', {
      filter: {
        case: {
          id: _caseId,
        },
      },
    });
    if (pubFlows.content.length > 0) {
      return await this.store.findRecord('publication-flow', pubFlows.content[0].id);
    }

    const creationDatetime = moment().utc()
      .toDate();
    let caze;
    if (!_caseId) {
      caze = this.store.createRecord('case', {
        title,
        shortTitle,
        created: creationDatetime,
      });
      await caze.save();
    } else {
      caze = await this.store.findRecord('case', _caseId, {
        reload: true,
      });
    }
    const toPublishStatus = await this.store.findRecord('publication-status', CONFIG.publicationStatusToPublish.id);
    const publicationFlow = this.store.createRecord('publication-flow', {
      publicationNumber,
      case: caze,
      created: creationDatetime,
      status: toPublishStatus,
      modified: creationDatetime,
    });
    await publicationFlow.save();
    await caze.belongsTo('publicationFlow').reload();
    return publicationFlow;
  }

  async linkContactPersonToPublication(publicationId, contactPerson) {
    const publicationFlow = await this.store.findRecord('publication-flow', publicationId, {
      include: 'contact-persons',
    });
    const contactPersonList = await publicationFlow.get('contactPersons');
    contactPersonList.pushObject(contactPerson);
    publicationFlow.set('contactPersons', contactPersonList);
    publicationFlow.save().then(() => {
      this.toaster.success(this.intl.t('contact-added-toast-message'), this.intl.t('contact-added-toast-title'));
      publicationFlow.hasMany('contactPersons').reload();
    })
      .catch(() => {
        // TODO: Functionele logging hier toevoegen
        this.toaster.error(this.intl.t('contact-added-toast-error-message'), this.intl.t('toast-error-title'));
      });
  }

  async publicationNumberAlreadyTaken(publicationNumber, publicationFlowId) {
    const publicationWithId = await this.store.query('publication-flow', {
      filter: {
        ':exact:publication-number': publicationNumber,
      },
    });
    const publicationNumberTakenList = publicationWithId.filter((publicationFlow) => publicationFlow.id !== publicationFlowId);
    return publicationNumberTakenList.toArray().length !== 0;
  }

  async getNewPublicationNextNumber() {
    const publications = await this.store.query('publication-flow', {
      sort: '-publication-number',
    });
    if (publications !== null) {
      const latestPublication = publications.toArray()[0];
      return latestPublication.publicationNumber + 1;
    }
    return 0;
  }
}
