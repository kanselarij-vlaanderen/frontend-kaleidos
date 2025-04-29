import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { TrackedArray } from 'tracked-built-ins';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class AgendaDocumentsRoute extends Route {
  @service store;

  async model() {
    const meeting = this.modelFor('agenda').meeting;
    let pieces = await this.store.queryAll('piece', {
      'filter[meeting][:id:]': meeting.id,
      include: 'document-container',
    });
    pieces = pieces.slice();
    return await sortPieces(pieces);
  }

  async afterModel() {
    this.defaultAccessLevel = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);
  }

  setupController(controller) {
    super.setupController(...arguments);
    const meeting = this.modelFor('agenda').meeting;
    controller.meeting = meeting;
    const agenda = this.modelFor('agenda').agenda;
    controller.agenda = agenda;
    controller.defaultAccessLevel = this.defaultAccessLevel;
  }

  resetController(controller, isExiting) { 
    if (isExiting) {
      controller.isOpenBatchDetailsModal = false;
      controller.isOpenPieceUploadModal = false;

      // cleanup any unsaved pieces
      Promise.all(
        controller.newPieces.map(async (piece) => {
          if (!piece?.id) {
            await deletePiece(piece);
          }
        }),
      ).then(() => (controller.newPieces = new TrackedArray([])));
    }
  }
}
