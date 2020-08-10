import Service, { inject } from '@ember/service';
import { ajax } from 'fe-redpencil/utils/ajax';
import moment from 'moment';

export default Service.extend({
  store: inject(),
  intl: inject(),

  getPostPonedSubcaseIds() {
    return ajax(
      {
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
        method: 'GET',
        url: '/custom-subcases/getPostponedSubcases',
      }
    ).then(({
      data,
    }) => data.map((object) => object.id));
  },

  async getSubcasePhases(subcase) {
    return ajax({
      method: 'GET',
      url: `/custom-subcases/getSubcasePhases?subcaseId=${subcase.id}`,
    }).then((result) => this.processSubcasePhases(result.body))
      .catch((error) => {
        console.log('error', error);
      });
  },

  // eslint-disable-next-line camelcase
  setNewMandateeToRelatedOpenSubcases(old_mandatee, new_mandatee) {
    return ajax(
      {
        method: 'POST',
        url: '/minister-jurisdiction-service/transfer/procedures',
        data: {
          // eslint-disable-next-line camelcase
          old_mandatee,
          // eslint-disable-next-line camelcase
          new_mandatee,
        },
      }
    ).then(({
      data,
    }) => data);
  },

  processSubcasePhases(activities) {
    // KAS-1425 sort activities? done in the micro service atm.
    if (typeof activities === 'string') {
      return null;
    }
    const phases = [];
    activities.map((activityData) => {
      if (activityData.startDatum) {
        phases.push({
          label: this.intl.t('activity-phase-proposed-for-agenda'), date: moment.utc(activityData.startDatum).toDate(),
        });
      }
      if (activityData.phaseData) {
        const {
          phaseData,
        } = activityData;
        if (phaseData.geplandeStart) {
          const geplandeStart = moment.utc(phaseData.geplandeStart).toDate();
          phases.push({
            label: this.intl.t('activity-phase-approved-on-agenda'), date: geplandeStart,
          });
          // TODO: Check triple equals
          // eslint-disable-next-line eqeqeq
          if (phaseData.postponed && phaseData.postponed == 'true') {
            phases.push({
              label: this.intl.t('activity-phase-postponed-on-agenda'), date: geplandeStart,
            });
          }
          if (phaseData.approved) {
            let label;
            switch (phaseData.approved) {
              case 'http://mu.semte.ch/vocabularies/core/56312c4b-9d2a-4735-b0b1-2ff14bb524fd':
                label = this.intl.t('activity-phase-decided-on-agenda');
                break;
              case 'http://mu.semte.ch/vocabularies/core/a29b3ffd-0839-45cb-b8f4-e1760f7aacaa':
                label = this.intl.t('activity-phase-postponed-is-decided');
                break;
              case 'http://mu.semte.ch/vocabularies/core/9f342a88-9485-4a83-87d9-245ed4b504bf':
                label = this.intl.t('activity-phase-kennisname');
                break;
              case 'http://mu.semte.ch/vocabularies/core/e7e44027-fbbb-4285-ba3f-0cdb2264d43c':
                label = this.intl.t('activity-phase-decided-voorwaarden');
                break;
              case 'http://mu.semte.ch/vocabularies/core/e40d885e-a677-4f1e-bce1-ea17d2aadb40':
                label = this.intl.t('activity-phase-afgekeurd');
                break;
            }
            phases.push({
              label: label, date: geplandeStart,
            });
          }
        }
      }
    });
    return phases;
  },

});
