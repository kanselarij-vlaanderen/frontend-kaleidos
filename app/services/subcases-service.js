import Service, { inject as service } from '@ember/service';
import { ajax } from 'frontend-kaleidos/utils/ajax';
import moment from 'moment';

export default class SubcasesService extends Service {
  @service store;
  @service intl;

  getPostPonedSubcaseIds() {
    return ajax({
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      method: 'GET',
      url: '/custom-subcases/getPostponedSubcases',
    }).then(({ data }) => data.map((object) => object.id));
  }

  async getSubcasePhases(subcase) {
    return ajax({
      method: 'GET',
      url: `/custom-subcases/getSubcasePhases?subcaseId=${subcase.id}`,
    })
      .then((result) => this.processSubcasePhases(result.body))
      .catch((error) => {
        console.log('error', error);
      });
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
            const drc = await this.store.findRecord(
              'decision-result-code',
              phaseData.decisionResultId
            );
            if (drc) {
              phases.push({
                label: `${drc.label} ${this.intl.t(
                  'decision-activity-result'
                )}`,
                date: geplandeStart,
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
  }
}
