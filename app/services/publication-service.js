/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';
import { ajax } from 'frontend-kaleidos/utils/ajax';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class PublicationService extends Service {
  @service store;
  @service toaster;
  @service intl;

  // Tracked.
  @tracked cachedData = A([]);

  async createNewPublication(publicationNumber, _caseId, title, shortTitle) {
    // Work with the case.
    // Test if dossier already had publication (index not up to date).
    // For people that dont refresh and we're in a SPA.
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
    await caze.hasMany('publicationFlows').reload();
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

  getPublicationCountsPerTypePerStatus(totals, ActivityType, ActivityStatus) {
    for (let index = 0; index < totals.length; index++) {
      const item = totals[index];
      if (item.activityType === ActivityType) {
        if (item.status === ActivityStatus) {
          return parseInt(item.count, 10);
        }
      }
    }
    return 0;
  }

  getPublicationCounts(publicationId) {
    if (this.cachedData[publicationId]) {
      return this.cachedData[publicationId];
    }
    this.cachedData[publicationId] = ajax({
      method: 'GET',
      url: `/lazy-loading/getCountsForPublication?uuid=${publicationId}`,
    }).then((result) => result.body.counts);
    return this.cachedData[publicationId];
  }

  invalidatePublicationCache() {
    this.cachedData = A([]);
  }

  async createNumacNumber(name, publicationFlow) {
    const numacNumber = await this.store.createRecord('numac-number', {
      name: name,
      publicationFlow: publicationFlow,
    });
    await numacNumber.save();
    await publicationFlow.hasMany('numacNumbers').reload();
    return numacNumber;
  }

  async unlinkNumacNumber(numacNumber, publicationFlow) {
    await numacNumber.destroyRecord();
    await publicationFlow.hasMany('numacNumbers').reload();
  }
}
