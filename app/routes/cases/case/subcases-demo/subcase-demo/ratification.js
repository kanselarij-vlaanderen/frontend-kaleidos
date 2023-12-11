import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import VrLegacyDocumentName,
{ compareFunction as compareLegacyDocuments } from 'frontend-kaleidos/utils/vr-legacy-document-name';

export default class CasesCaseSubcasesDemoSubcaseDemoRatificationRoute extends Route {
  @service store;
  @service currentSession;

  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
  };

  beforeModel() {
    this.decisionmakingFlow = this.modelFor('cases.case');
  }

  async model(params) {
    this.subcase = this.modelFor('cases.case.subcases-demo.subcase-demo');
    const subcase = this.modelFor('cases.case.subcases-demo.subcase-demo');
    // For showing the history of subcases within this route, we need a list of subcases without the current model
    //  We want to sort descending on date the subcase was concluded.
    //  In practice, reverse sorting on created will be close
    const siblingSubcases = await this.store.query('subcase', {
      'filter[decisionmaking-flow][:id:]': this.decisionmakingFlow.id,
      page: {
        number: params.page,
        size: params.size,
      },
      sort: '-created',
    });

    // Get any submission that is not yet on a meeting
    const submissionActivitiesWithoutActivity = await this.store.query('submission-activity', {
      'filter[subcase][:id:]': this.subcase.id,
      'filter[:has-no:agenda-activity]': true,
      'page[size]': PAGE_SIZE.ACTIVITIES,
      include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
    });
    let submissionActivities = [...submissionActivitiesWithoutActivity.toArray()];
    // Get the submission from latest meeting if applicable
    const agendaActivities = await this.subcase.agendaActivities;
    const latestActivity = agendaActivities.sortBy('startDate')?.lastObject;
    if (latestActivity) {
      this.latestMeeting = await this.store.queryOne('meeting', {
        'filter[agendas][agendaitems][agenda-activity][:id:]': latestActivity.id,
        sort: '-planned-start',
      });
      const submissionActivitiesFromLatestMeeting = await this.store.query('submission-activity', {
        'filter[subcase][:id:]': this.subcase.id,
        'filter[agenda-activity][:id:]': latestActivity.id,
        'page[size]': PAGE_SIZE.ACTIVITIES,
        include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
      });
      submissionActivities.addObjects(submissionActivitiesFromLatestMeeting.toArray());
    }

    const pieces = [];
    for (const submissionActivity of submissionActivities.toArray()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.toArray();
      pieces.push(...submissionPieces);
    }

    let sortedPieces;
    if (this.latestMeeting?.isPreKaleidos) {
      sortedPieces = sortPieces(pieces, VrLegacyDocumentName, compareLegacyDocuments);
    } else {
      sortedPieces = sortPieces(pieces);
    }

    return {
      pieces: sortedPieces,
      subcase,
      siblingSubcases,
    };
  }

  async afterModel(model) {
    this.defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      this.subcase.confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

    // Additional failsafe check on document visibility. Strictly speaking this check
    // is not necessary since documents are not propagated by Yggdrasil if they
    // should not be visible yet for a specific profile.
    if (this.currentSession.may('view-documents-before-release')) {
      this.documentsAreVisible = true;
    } else {
      const documentPublicationActivity = await this.latestMeeting?.internalDocumentPublicationActivity;
      const documentPublicationStatus = await documentPublicationActivity?.status;
      this.documentsAreVisible = documentPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
    }
    const decisionmakingFlow = this.modelFor('cases.case');
    this.case = await decisionmakingFlow.case;
    
    this.mandatees = (await model.subcase.mandatees).sortBy('priority');
    this.submitter = await model.subcase.requestedBy;
    const agendaActivities = await model.subcase.agendaActivities;
    const latestActivity = agendaActivities.sortBy('startDate')?.lastObject;
    if (latestActivity) {
      this.meeting = await this.store.queryOne('meeting', {
        'filter[agendas][agendaitems][agenda-activity][:id:]': latestActivity.id,
        sort: '-planned-start',
      });
      this.agenda = await this.meeting?.belongsTo('agenda').reload();
    }
    await model.subcase.governmentAreas;
  }

  async setupController(controller) {
    super.setupController(...arguments);
    const subcase = this.modelFor('cases.case.subcases.subcase');
    controller.subcase = subcase;
    controller.case = this.case;
    controller.documentsAreVisible = this.documentsAreVisible;
    controller.defaultAccessLevel = this.defaultAccessLevel;
    controller.mandatees = this.mandatees;
    controller.submitter = this.submitter;
    controller.decisionmakingFlow = this.decisionmakingFlow;
    controller.meeting = this.meeting;
    controller.agenda = this.agenda;
    controller.governmentAreas = this.governmentAreas;
  }
}