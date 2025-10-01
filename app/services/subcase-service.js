import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { getJsonPayloadOrThrow } from 'frontend-kaleidos/utils/json-util';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class SubcaseService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service draftSubmissionService;

  async loadSubcasePieces(subcase) {
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    if (!subcase.id) {
      return [];
    }
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

  async getLatestDecisionActivity(subcase) {
    const agendaitem = await this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-agenda-activity.start-date,-created',
    });
    if (agendaitem?.id) {
      return await this.store.queryOne('decision-activity', {
        'filter[treatment][agendaitems][:id:]': agendaitem.id,
      });
    }
  }

  async getRelatedAgendas(subcase) {
    const url = `/subcases/${subcase.id}/agendas`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/vnd.api+json' },
    });
    try {
      const json = await getJsonPayloadOrThrow(response);
      return await Promise.all(json.data.map(async (entry) => ({
        visible: entry.attributes.visible,
        agenda: {
          id: entry.attributes.agendaId,
          status: await this.store.findRecordByUri('concept', entry.attributes.status),
        },
        meeting: {
          id: entry.attributes.meetingId,
          uri: entry.attributes.uri,
          number: Number(entry.attributes.number),
          plannedStart: new Date(entry.attributes.plannedStart),
          kind: await this.store.findRecordByUri('concept', entry.attributes.kind),
          hasKindEP: entry.attributes.kind === CONSTANTS.MEETING_KINDS.EP,
        },
        agendaitem: {
          id: entry.attributes.agendaitemId,
        },
        agendaActivity: {
          id: entry.attributes.agendaActivityId,
          startDate: new Date(entry.attributes.agendaActivityStart),
        },
        decisionResultCode: entry.attributes.decisionResultCode
        ? await this.store.findRecordByUri(
            'concept',
            entry.attributes.decisionResultCode,
          )
        : null,
      })));
    } catch (error) {
      const message = error?.message ? `: ${error?.message}` : '';
      this.toaster.error(
        this.intl.t('error-getting-related-subcase-agendas') + `${message}`,
        this.intl.t('warning-title')
      );
      throw error;
    }
  }

  async isOnDesignAgenda(subcase) {
    const relatedAgendas = await this.getRelatedAgendas(subcase);
    if (relatedAgendas.length) {
      return (
        relatedAgendas[0].agenda.status.uri ===
        CONSTANTS.AGENDA_STATUSSES.DESIGN
      );
    }
    return false;
  }

  async deleteSubcaseFullyForSubmission(subcase, submission) {
    if (submission.decisionmakingFlowTitle) {
      const decisionmakingFlow = await submission.belongsTo('decisionmakingFlow').reload();
      const subcases = await decisionmakingFlow.hasMany('subcases').reload();
      if (subcases.length === 1 && subcases.at(0).id === subcase.id) {
        const _case = await decisionmakingFlow.case;
        await _case.destroyRecord();
        await decisionmakingFlow.destroyRecord();
      }
    }
    const piecesNotOnSubmission = await this.store.queryAll('piece', {
      'filter[submission-activities][subcase][:id:]': subcase.id,
      'filter[:has-no:draft-piece]': true,
    });
    // Delete subcase
    await subcase.destroyRecord();
    // Delete submission activity
    const submissionActivities = await submission.submissionActivities;
    await Promise.all((submissionActivities.map((activity) => activity.destroyRecord())));
    // submission still has acceptedPieces connected to draftPieces, but are we always allowed to delete the acceptedpieces?
    const acceptedPiecesOfSubmission = await this.store.queryAll('piece', {
      'filter[draft-piece][submission][:id:]': submission.id,
    });

    await Promise.all(acceptedPiecesOfSubmission.map(async (piece) => {
      await deletePiece(piece, false);
    }));
    await Promise.all(piecesNotOnSubmission.map(async (piece) => {
      await deletePiece(piece, false);
    }));
  }
}
