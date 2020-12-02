import Service, { inject } from '@ember/service';
import { ajax } from 'fe-redpencil/utils/ajax';
import { trimText } from 'fe-redpencil/utils/trim-util';
import moment from 'moment';

export default Service.extend({
  store: inject(),
  intl: inject(),

  createSubcase(_case, type, shortTitle, title) {
    const creationDatetime = moment().utc()
      .toDate();
    return this.store.createRecord('subcase', {
      type,
      shortTitle: trimText(shortTitle),
      title: trimText(title),
      // TODO: wat moeten we hier in steken?
      // confidential: confidential || false,
      // showAsRemark: showAsRemark || false,
      case: _case,
      created: creationDatetime,
      modified: creationDatetime,
      isArchived: false,
      agendaActivities: [],
    });
  },

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

  async processSubcasePhases(activities) {
    // KAS-1425 sort activities? done in the micro service atm.
    if (typeof activities === 'string') {
      return null;
    }
    const phases = [];
    for (let index = 0; index < activities.length; index++) {
      const activityData = activities[index];
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
          if (phaseData.decisionResultId) {
            const drc = await this.store.findRecord('decision-result-code', phaseData.decisionResultId);
            if (drc) {
              phases.push({
                label: `${drc.label} ${this.intl.t('decision-activity-result')}`, date: geplandeStart,
              });
              if (drc.isPostponed) {
                phases.push({
                  label: this.intl.t('decision-activity-result-postponed'),
                });
              }
            }
          }
        }
      }
    }
    return phases;
  },

});
