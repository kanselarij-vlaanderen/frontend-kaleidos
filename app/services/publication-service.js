/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';

export default class PublicationService extends Service {
  @service store;
  @service toaster;
  @service intl;


  async createNewPublication(publicationNumber, _case, title, shortTitle) {
    const creationDatetime = moment().utc()
      .toDate();
    let caze;
    if (!_case) {
      caze = this.store.createRecord('case', {
        title,
        shortTitle,
        created: creationDatetime,
      });
      await caze.save();
    } else {
      caze = _case;
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
    })
      .catch(() => {
        // TODO: Functionele logging hier toevoegen
        this.toaster.error(this.intl.t('contact-added-toast-error-message'), this.intl.t('toast-error-title'));
      });
  }
}
