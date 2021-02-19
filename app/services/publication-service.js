/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import { ajax } from 'fe-redpencil/utils/ajax';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class PublicationService extends Service {
  @service store;
  @service toaster;
  @service intl;

  // Tracked.
  @tracked cachedData = A([]);

  async createNewPublication(publicationNumber, publicationSuffix, _caseId, title, shortTitle) {
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
      publicationSuffix,
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

  async publicationNumberAlreadyTaken(publicationNumber, publicationSuffix, publicationFlowId) {
    let publicationsFromQuery;
    if (publicationSuffix && !(publicationSuffix === '')) {
      // if a valid suffix is given, we check if the number + suffix combo has been taken instead
      publicationsFromQuery = await this.store.query('publication-flow', {
        filter: {
          // :exact: does not work on numbers.
          'publication-number': publicationNumber,
          ':exact:publication-suffix': publicationSuffix,
        },
      });
    } else {
      // if no suffix is given, we query only on same number but we have to filter out everything that has a suffix
      // filtering on non-existing attributes, is this possible in a query?
      const publicationsFromQueryWithSameNumber = await this.store.query('publication-flow', {
        filter: {
          // :exact: does not work on numbers.
          'publication-number': publicationNumber,
        },
      });
      publicationsFromQuery = publicationsFromQueryWithSameNumber.filter((publicationFlow) => !publicationFlow.publicationSuffix);
    }
    // filter own model from data or we can't save our own number
    const publicationNumberTakenList = publicationsFromQuery.filter((publicationFlow) => publicationFlow.id !== publicationFlowId);
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
