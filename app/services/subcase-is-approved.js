import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubcaseIsApprovedService extends Service {
  @service store;

  async isApproved(subcase) {
    // we need to see if the last meeting isFinal
    const agendaActivities = await subcase.agendaActivities;
    const latestActivity = agendaActivities?.sortBy('startDate').lastObject;
    const latestMeeting = await this.store.queryOne('meeting', {
      'filter[agendas][agendaitems][agenda-activity][:id:]': latestActivity?.id,
      sort: '-planned-start',
    });

    if (latestMeeting?.isFinal) {
      const approvedDecisionResultCode = await this.store.findRecordByUri(
        'concept',
        CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
      );
      const acknowledgedDecisionResultCode = await this.store.findRecordByUri(
        'concept',
        CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME
      );

      const nrDecisionActivities = await this.store.count('decision-activity', {
        'filter[subcase][:id:]': subcase.id,
        'filter[decision-result-code][:id:]': [
          approvedDecisionResultCode.id,
          acknowledgedDecisionResultCode.id,
        ].join(','),
      });
      return nrDecisionActivities > 0;
    }
    return false;
  }
}
