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

  async getNewPublicationNextNumber(isViaMinisterCouncil) {
    if (isViaMinisterCouncil) {
      // nextnumber generation implementation for via minister council
    } else {
      return (await this.store.query('publication-flow', {
        filter: {
          ':has:case': 'yes',
          case: {
            ':has-no:subcases': 'yes',
          },
          status: {
            id: CONFIG.publicationStatusToPublish.id,
          },
        },
      })).length + 1;
    }
  }
}
