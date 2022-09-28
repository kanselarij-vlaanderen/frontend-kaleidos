import Service, { inject as service } from '@ember/service';
import moment from 'moment';
import fetch from 'fetch';

export default class SubcasesService extends Service {
  @service store;
  @service intl;

  async getPostPonedSubcaseIds() {
    const response = await fetch('/custom-subcases/getPostponedSubcases', {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.api+json',
      },
    });
    const payload = await response.json();
    return payload.map((object) => object.id);
  }

  async getSubcasePhases(subcase) {
    const response = await fetch(
      `/custom-subcases/getSubcasePhases?subcaseId=${subcase.id}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.api+json',
        },
      }
    );
    const payload = await response.json();
    return this.processSubcasePhases(payload.body);
  }

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
          label: this.intl.t('activity-phase-proposed-for-agenda'),
          date: moment.utc(activityData.startDatum).toDate(),
        });
      }
      if (activityData.phaseData) {
        const { phaseData } = activityData;
        if (phaseData.geplandeStart) {
          const geplandeStart = moment.utc(phaseData.geplandeStart).toDate();
          phases.push({
            label: this.intl.t('activity-phase-approved-on-agenda'),
            date: geplandeStart,
          });
          if (phaseData.decisionResultId) {
            // KAS-3359 Why don't we load in this data in the custom-subcases-service?
            // We already have the decision-result resource in the backend query,
            // we could just send the label to the frontend as well and shave off a request here.
            // See: https://github.com/kanselarij-vlaanderen/custom-subcases-service/blob/d5ba54049ecd0ae80d73d4c1875bc5855a394dbd/repository/index.js#L69
            const resultCode = await this.store.findRecord(
              'decision-result-code',
              phaseData.decisionResultId
            );
            if (resultCode) {
              phases.push({
                label: `${resultCode.label} ${this.intl.t(
                  'decision-activity-result'
                )}`,
                date: geplandeStart,
              });
              if (resultCode.isPostponed) {
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
  }
}
