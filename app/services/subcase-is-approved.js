import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubcaseIsApprovedService extends Service {
  @service store;

  async isApproved(subcase) {
    const meeting = await subcase?.requestedForMeeting;

    if (meeting?.isFinal) {
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
    const meeting = await subcase?.requestedForMeeting;

    if (meeting?.isFinal) {
      const retractedDecisionResultCode = await this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN
      );

      const nrDecisionActivities = await this.store.count('decision-activity', {
        'filter[subcase][:id:]': subcase.id,
        'filter[decision-result-code][:id:]': retractedDecisionResultCode.id,
      });
      return nrDecisionActivities > 0;
    }
    return false;
  }

  async isPostponed(subcase) {
    const meeting = await subcase?.requestedForMeeting;

    if (meeting?.isFinal) {
      const postponedDecisionResultCode = await this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD
      );

      const nrDecisionActivities = await this.store.count('decision-activity', {
        'filter[subcase][:id:]': subcase.id,
        'filter[decision-result-code][:id:]': postponedDecisionResultCode.id,
      });
      return nrDecisionActivities > 0;
    }
    return false;
  }
}
