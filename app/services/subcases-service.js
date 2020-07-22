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
    }).then((result) => {
      return this.processSubcasePhases(result.body);
    }).catch((error) => {
      console.log('error', error);
    });
  },

  setNewMandateeToRelatedOpenSubcases(old_mandatee, new_mandatee) {
    return ajax(
      {
        method: 'POST',
        url: '/minister-jurisdiction-service/transfer/procedures',
        data: {
          old_mandatee,
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
          if (phaseData.postponed && phaseData.postponed == 'true') {
            phases.push({
              label: this.intl.t('activity-phase-postponed-on-agenda'), date: geplandeStart,
            });
            if (phaseData.approved && phaseData.approved == 'true') {
              phases.push({
                label: this.intl.t('activity-phase-postponed-is-decided'),
              });
            }
          } else {
            if (phaseData.approved && phaseData.approved == 'true') {
              phases.push({
                label: this.intl.t('activity-phase-decided-on-agenda'), date: geplandeStart,
              });
            }
          }
        }
      }
    });
    return phases;
  },

});
