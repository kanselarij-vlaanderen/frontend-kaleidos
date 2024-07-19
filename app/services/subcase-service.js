import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class SubcaseService extends Service {
  @service store;

  async loadSubcasePieces(subcase) {
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = await this.store.query('submission-activity', {
      'filter[subcase][:id:]': subcase.id,
      'page[size]': PAGE_SIZE.CASES,
      include: 'pieces', // Make sure we have all pieces, unpaginated
    });
    const pieces = [];
    for (const submissionActivity of submissionActivities.slice()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.slice();
      pieces.push(...submissionPieces);
    }
    return pieces;
  }

  async isApproved(subcase) {
    // we need to see if the last meeting isFinal
    const agendaActivities = await subcase.agendaActivities;
    const latestActivity = agendaActivities
      ?.slice()
      ?.sort((a1, a2) => a1.startDate - a2.startdate)
      ?.at(-1);
    const latestMeeting = await this.store.queryOne('meeting', {
      'filter[agendas][agendaitems][agenda-activity][:id:]': latestActivity?.id,
      sort: '-planned-start',
    });
    const agenda = await latestMeeting.agenda;

    if (agenda) {
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
