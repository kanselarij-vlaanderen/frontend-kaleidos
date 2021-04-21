/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';
import { ajax } from 'frontend-kaleidos/utils/ajax';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class PublicationService extends Service {
  @service store;
  @service toaster;
  @service intl;

  // Tracked.
  @tracked cachedData = A([]);


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

  async publicationNumberAlreadyTaken(publicationNumber, publicationSuffix, publicationFlowId) {
    let publicationsFromQuery;
    if (publicationSuffix && !(publicationSuffix === '')) {
      // if a valid suffix is given, we check if the number + suffix combo has been taken instead
      publicationsFromQuery = await this.store.query('publication-flow', {
        filter: {
          ':exact:publication-number': `"${publicationNumber}"`, // Needs quotes because of bug in mu-cl-resources
          ':exact:publication-suffix': publicationSuffix,
        },
      });
    } else {
      // if no suffix is given, we query only on same number but we have to filter out everything that has a suffix
      // filtering on non-existing attributes, is this possible in a query?
      const publicationsFromQueryWithSameNumber = await this.store.query('publication-flow', {
        filter: {
          ':exact:publication-number': `"${publicationNumber}"`, // Needs quotes because of bug in mu-cl-resources
        },
      });
      publicationsFromQuery = publicationsFromQueryWithSameNumber.filter((publicationFlow) => !publicationFlow.publicationSuffix);
    }
    // filter own model from data or we can't save our own number
    const publicationNumberTakenList = publicationsFromQuery.filter((publicationFlow) => publicationFlow.id !== publicationFlowId);
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
