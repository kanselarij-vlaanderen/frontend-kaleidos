import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubcaseIsApprovedService extends Service {
  @service store;

  async isApproved(subcase) {
    // we need to see if the last meeting isFinal
    const latestMeeting = await this.store.queryOne('meeting', {
      'filter[agendas][agendaitems][treatment][decision-activity][subcase][:id:]': subcase.id,
      sort: '-planned-start',
    });

    // TODO KAS-3667 I think the isFinal is a check so that we don't show the approved status unless the meeting is approved
    // Not sure how this should work with multiple meetings (postponed)
    if (latestMeeting?.isFinal) {
      const approvedDecisionResultCode = await this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
      );
      const acknowledgedDecisionResultCode = await this.store.findRecordByUri(
        'decision-result-code',
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

  async isRetracted(subcase) {
    const latestMeeting = await this.store.queryOne('meeting', {
      'filter[agendas][agendaitems][treatment][decision-activity][subcase][:id:]': subcase.id,
      sort: '-planned-start',
    });

    if (latestMeeting?.isFinal) {
      const nrDecisionActivities = await this.store.count('decision-activity', {
        'filter[subcase][:id:]': subcase.id,
        'filter[decision-result-code][:uri:]': CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN,
      });
      return nrDecisionActivities > 0;
    }
    return false;
  }

  async isPostponed(subcase) {
    const latestMeeting = await this.store.queryOne('meeting', {
      'filter[agendas][agendaitems][treatment][decision-activity][subcase][:id:]': subcase.id,
      sort: '-planned-start',
    });

    if (latestMeeting?.isFinal) {
      const nrDecisionActivities = await this.store.count('decision-activity', {
        'filter[subcase][:id:]': subcase.id,
        'filter[decision-result-code][:uri:]': CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD,
      });
      return nrDecisionActivities > 0;
    }
    return false;
  }
}
