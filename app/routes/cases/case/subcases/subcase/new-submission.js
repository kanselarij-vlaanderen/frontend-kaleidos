import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { addObjects } from 'frontend-kaleidos/utils/array-helpers';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { TrackedArray } from 'tracked-built-ins';

export default class CasesCaseSubcasesSubcaseNewSubmissionRoute extends Route {
  @service store;

  pieces;
  defaultAccessLevel;
  requestedBy;
  mandatees;

  async model() {
    const { subcase } = this.modelFor('cases.case.subcases.subcase');

    this.defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      subcase.confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

    // Get any submission that is not yet on a meeting
    const submissionActivitiesWithoutActivity = await this.store.query(
      'submission-activity',
      {
        'filter[subcase][:id:]': subcase.id,
        'filter[:has-no:agenda-activity]': true,
        include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
      }
    );
    let submissionActivities = [...submissionActivitiesWithoutActivity.slice()];
    // Get the submission from latest meeting if applicable
    const agendaActivities = await subcase.agendaActivities;
    const latestActivity = agendaActivities
      .slice()
      .sort((a1, a2) => a1.startDate - a2.startDate)
      .at(-1);
    if (latestActivity) {
      this.latestMeeting = await this.store.queryOne('meeting', {
        'filter[agendas][agendaitems][agenda-activity][:id:]':
          latestActivity.id,
        sort: '-planned-start',
      });
      const submissionActivitiesFromLatestMeeting = await this.store.query(
        'submission-activity',
        {
          'filter[subcase][:id:]': subcase.id,
          'filter[agenda-activity][:id:]': latestActivity.id,
          include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
        }
      );
      addObjects(
        submissionActivities,
        submissionActivitiesFromLatestMeeting.slice()
      );
    }

    const pieces = [];
    for (const submissionActivity of submissionActivities.slice()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.slice();
      for (const piece of submissionPieces) {
        const nextPiece = await piece.nextPiece;
        if (!nextPiece)
          pieces.push(piece);
      }
    }

    this.pieces = await sortPieces(pieces, {
      isPreKaleidos: this.latestMeeting?.isPreKaleidos,
    });

    this.requestedBy = await subcase.requestedBy;
    this.mandatees = await subcase.mandatees;
    return subcase;
  }

  setupController(controller, _model, _transition) {
    super.setupController(...arguments);
    controller.pieces = new TrackedArray(this.pieces.slice());
    controller.defaultAccessLevel = this.defaultAccessLevel;
    controller.requestedBy = this.requestedBy;
    controller.mandatees = this.mandatees;
  }
}
