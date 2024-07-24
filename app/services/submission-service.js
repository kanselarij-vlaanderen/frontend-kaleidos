import Service, { inject as service } from '@ember/service';
import { addObjects } from 'frontend-kaleidos/utils/array-helpers';

export default class SubmissionService extends Service {
  @service store;

  async loadSubmissionPieces(subcase, newPieces) {
    let pieces = [];
    if (subcase) {
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

      for (const submissionActivity of submissionActivities.slice()) {
        let submissionPieces = await submissionActivity.pieces;
        submissionPieces = submissionPieces.slice();
        pieces.push(...submissionPieces);
      }
      if (newPieces) {
        for (const piece of newPieces) {
          const previousPiece = await piece.previousPiece;
          if (previousPiece && previousPiece.constructor.modelName === 'piece') {
            for (let i = 0; i < pieces.length; i++) {
              if (pieces[i].id === previousPiece.id) {
                pieces[i] = piece;
              }
            }
          } else {
            pieces.push(piece);
          }
        }
      }
    }
    return pieces;
  }
}
