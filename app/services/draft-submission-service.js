import Service, { inject as service } from '@ember/service';
import constants from 'frontend-kaleidos/config/constants';
import { isEnabledCabinetSubmissions } from 'frontend-kaleidos/utils/feature-flag';

export default class DraftSubmissionService extends Service {
  @service store;
  @service currentSession;

  updateSubmissionStatus = async(submission, statusUri, comment='') => {
    const newStatus = await this.store.findRecordByUri('concept', statusUri);
    await this.createStatusChange(submission, statusUri, comment);
    submission.status = newStatus;
    await submission.save(); // ember will update the inverse + we do reloads
  };

  createStatusChange = async(submission, statusUri, comment='') => {
    const now = new Date();
    const currentUser = this.currentSession.user;
    const status = await this.store.findRecordByUri('concept', statusUri);

    const submissionStatusChangeActivity = this.store.createRecord(
      'submission-status-change-activity',
      {
        startedAt: now,
        startedBy: currentUser,
        comment,
        submission,
        status,

      }
    );
    await submissionStatusChangeActivity.save();
  };

  getStatusChangeActivities = async(submission) => {
    const statusChangeActivities = await submission.hasMany('statusChangeActivities').reload();
    await Promise.all(statusChangeActivities.map((a) => a.status));
    await Promise.all(statusChangeActivities.map((a) => a.startedBy));
    return statusChangeActivities
      .slice()
      .sort((a1, a2) => a1.startedAt.getTime() - a2.startedAt.getTime())
      .reverse();
  };

  getLatestTreatedBy = async(submission, currentlyBeingTreated=false) => {
    let statusChangeActivities = await this.getStatusChangeActivities(submission);
    if (currentlyBeingTreated) {
      // use only the latest activity
      statusChangeActivities = [statusChangeActivities.at(0)];
    }
    const treatedByActivity = statusChangeActivities?.filter((a) => a.status.get('uri') === constants.SUBMISSION_STATUSES.IN_BEHANDELING)
      .at(0);
    const user = await treatedByActivity?.startedBy;
    return user;
  };

  getCreator = async(submission) => {
    const statusChangeActivities = await this.getStatusChangeActivities(submission);
    const creationActivity = statusChangeActivities
      ?.filter(
        (a) =>
          a.status.get('uri') === constants.SUBMISSION_STATUSES.INGEDIEND ||
          a.status.get('uri') === constants.SUBMISSION_STATUSES.UPDATE_INGEDIEND
      )
      .at(0);
    // What if this is null (should never happen, mails depend on this to exist)
    const user = await creationActivity?.startedBy;
    return user;
  };

  getIsUpdate = async(submission) => {
    const statusChangeActivities = await this.getStatusChangeActivities(submission);
    const creationActivity = statusChangeActivities
      ?.filter(
        (a) =>
          a.status.get('uri') === constants.SUBMISSION_STATUSES.UPDATE_INGEDIEND
      )
      .at(0);
    return creationActivity ? true : false;
  };

  getAllSubmissionsForSubcase = async(subcase) => {
    const allSubmissions = await this.store.query('submission', {
      'filter[subcase][:id:]': subcase.id,
      sort: '-created',
      include: 'status'
    });
    return allSubmissions;
  };

  getOngoingSubmissionForSubcase = async(subcase) => {
    // "ongoing" can be defined as "not accepted" or "accepted but not yet propagated"
    // check if all pieces are propagated on latest submission.
    const latestSubmission = await this.getLatestSubmissionForSubcase(subcase);
    const allDraftPiecesAccepted = await this.allDraftPiecesAccepted(subcase, latestSubmission);
    if (latestSubmission?.id && !allDraftPiecesAccepted) {
      return latestSubmission;
    }
    return null;
  };

  getOriginalSubmissionForSubcase = async(subcase) => {
    const allSubmissions = await this.getAllSubmissionsForSubcase(subcase);
    return allSubmissions?.at(-1);
  };

  getLatestSubmissionForSubcase = async(subcase) => {
    const allSubmissions = await this.getAllSubmissionsForSubcase(subcase);
    return allSubmissions?.at(0);
  };

  allDraftPiecesAccepted = async(subcase, latestSubmission) => {
    if (!latestSubmission?.id) {
      latestSubmission = await this.getLatestSubmissionForSubcase(subcase);
    }
    if (latestSubmission?.id) {
      let pieces = await latestSubmission?.hasMany('pieces').reload();
      pieces = pieces?.slice();
      for (const piece of pieces) {
        const actualPiece = await piece.acceptedPiece;
        if (!actualPiece) {
          return false;
        }
      }
    }
    return true;
  }

  canSubmitNewDocumentsOnSubcase = async(subcase) => {
    if (!isEnabledCabinetSubmissions() || !this.currentSession.may('create-submissions')) {
      return false;
    }
    const submitter = await subcase.requestedBy;
    const currentUserOrganization = await this.currentSession.organization;
    const currentUserOrganizationMandatees = await currentUserOrganization.mandatees;
    const currentUserOrganizationMandateesUris = currentUserOrganizationMandatees.map((mandatee) => mandatee.uri);
    const hasCorrectMandatee = !submitter?.uri || currentUserOrganizationMandateesUris.includes(submitter?.uri);
    if (!hasCorrectMandatee) {
      return false;
    }
    const ongoingSubmission = await this.getOngoingSubmissionForSubcase(subcase);
    if (ongoingSubmission?.id) {
      return false;
    }
    const latestAgendaActivity = await this.store.queryOne(
      'agenda-activity',
      {
        'filter[subcase][:id:]': subcase.id,
        sort: '-start-date',
      }
    );
    if (latestAgendaActivity?.id) {
      const latestAgendaitem = await this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': latestAgendaActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });
      const agenda = await latestAgendaitem?.agenda;
      const meeting = await agenda?.meeting;
      if (meeting) {
        return false;
      }
    }
    const canSubmitNewDocuments = await this.allDraftPiecesAccepted(subcase);
    return canSubmitNewDocuments;
  }

  getAllSubmissionsForDecisionmakingFlow = async(decisionmakingFlow) => {
    const allSubmissions = await this.store.queryAll('submission', {
      'filter[decisionmaking-flow][:id:]': decisionmakingFlow.id,
      sort: '-created',
      include: 'status,subcase'
    });
    return allSubmissions;
  };

  getLatestSubmissionForDecisionmakingFLow = async(decisionmakingFlow) => {
    const allSubmissions = await this.getAllSubmissionsForDecisionmakingFlow(decisionmakingFlow);
    return allSubmissions?.slice().at(0);
  };
}
