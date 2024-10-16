import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { addObjects } from 'frontend-kaleidos/utils/array-helpers';

export default class CasesCaseSubcasesSubcaseIndexRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  beforeModel() {
    this.decisionmakingFlow = this.modelFor('cases.case').decisionmakingFlow;
  }

  async model() {
    const { decisionmakingFlow, subcase, subcases, parliamentFlow } = this.modelFor('cases.case.subcases.subcase');
    const _case = await decisionmakingFlow.case;
    const subcaseIds = subcases?.map((subcase) => subcase.id);
    if (!subcaseIds.includes(subcase.id)) {
      // subcase is not linked to this decisionmakingFlow
      this.router.transitionTo('cases.case.subcases', decisionmakingFlow.id);
    }

     // Get any submission that is not yet on a meeting
     const submissionActivitiesWithoutActivity = await this.store.query('submission-activity', {
      'filter[subcase][:id:]': subcase.id,
      'filter[:has-no:agenda-activity]': true,
      include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
    });
    let submissionActivities = [...submissionActivitiesWithoutActivity.slice()];
    // Get the submission from latest meeting if applicable
    const agendaActivities = await subcase.agendaActivities;
    const latestActivity = agendaActivities
      .slice()
      .sort((a1, a2) => a1.startDate - a2.startDate)
      .at(-1);
    if (latestActivity) {
      this.latestMeeting = await this.store.queryOne('meeting', {
        'filter[agendas][agendaitems][agenda-activity][:id:]': latestActivity.id,
        sort: '-planned-start',
      });
      const submissionActivitiesFromLatestMeeting = await this.store.query('submission-activity', {
        'filter[subcase][:id:]': subcase.id,
        'filter[agenda-activity][:id:]': latestActivity.id,
        include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
      });
      addObjects(submissionActivities, submissionActivitiesFromLatestMeeting.slice());
    }

    const pieces = [];
    for (const submissionActivity of submissionActivities.slice()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.slice();
      pieces.push(...submissionPieces);
    }

    const sortedPieces = await sortPieces(
      pieces, { isPreKaleidos: this.latestMeeting?.isPreKaleidos }
    );

    await subcase.type;

    return {
      decisionmakingFlow,
      _case,
      subcase,
      parliamentFlow,
      subcases,
      pieces: sortedPieces,
    };
  }

  async afterModel(model) {
    const subcase = model.subcase;
    const unsortedMandatees = await subcase.mandatees;
    this.mandatees = unsortedMandatees
      .slice()
      .sort((m1, m2) => m1.priority - m2.priority);
    this.submitter = await subcase.requestedBy;
    const agendaActivities = await subcase.agendaActivities;
    const latestActivity = agendaActivities
      .slice()
      .sort((a1, a2) => a1.startDate - a2.startDate)
      .at(-1);
    if (latestActivity) {
      this.meeting = await this.store.queryOne('meeting', {
        'filter[agendas][agendaitems][agenda-activity][:id:]': latestActivity.id,
        sort: '-planned-start',
      });
      this.agenda = await this.meeting?.belongsTo('agenda').reload();
    }
    await subcase.governmentAreas;
    this.defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      subcase.confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

    if (this.currentSession.may('view-documents-before-release')) {
      this.documentsAreVisible = true;
    } else {
      const documentPublicationActivity = await this.latestMeeting?.internalDocumentPublicationActivity;
      const documentPublicationStatus = await documentPublicationActivity?.status;
      this.documentsAreVisible = documentPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
    }
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.mandatees = this.mandatees;
    controller.submitter = this.submitter;
    controller.decisionmakingFlow = this.decisionmakingFlow;
    controller.meeting = this.meeting;
    controller.agenda = this.agenda;
    controller.governmentAreas = this.governmentAreas;
    controller.documentsAreVisible = this.documentsAreVisible;
    controller.defaultAccessLevel = this.defaultAccessLevel;
  }
}
