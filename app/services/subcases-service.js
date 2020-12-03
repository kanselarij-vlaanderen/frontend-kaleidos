import Service, { inject } from '@ember/service';
import { ajax } from 'fe-redpencil/utils/ajax';
import { trimText } from 'fe-redpencil/utils/trim-util';
import moment from 'moment';

export default Service.extend({
  store: inject(),
  intl: inject(),

  /**
   * Create a subcase for a publicationFlow
   *
   * @param _case
   * @param _publicationFlow
   * @param subcaseTypeObject
   * @param shortTitle
   * @param title
   * @returns {Promise<any>}
   */
  async createSubcaseForPublicationFlow(_case, _publicationFlow, subcaseTypeObject, shortTitle, title) {
    const creationDatetime = moment().utc()
      .toDate();

    // create Subcase.
    const subcase = await this.store.createRecord('subcase', {
      type: subcaseTypeObject,
      shortTitle: trimText(shortTitle),
      title: trimText(title),
      // TODO: wat moeten we hier in steken?
      // confidential: confidential || false,
      // showAsRemark: showAsRemark || false,
      case: _case,
      publicationFlow: _publicationFlow,
      created: creationDatetime,
      modified: creationDatetime,
      isArchived: false,
      agendaActivities: [],
    });

    // Persist to DB.
    await subcase.save();

    // Reload publication flow relation to subcase.
    await subcase.belongsTo('publicationFlow').reload();

    return subcase;
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
