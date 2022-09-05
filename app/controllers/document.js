import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restorePiecesFromPreviousAgendaitem } from 'frontend-kaleidos/utils/documents';

export default class DocumentController extends Controller {
  @service router;
  @service store;
  @service fileService;
  @service signatureService;

  @tracked pieceIsFromDecision;

  @action
  transitionBack() {
    // If no route where you returned from go to the home page
    if (history.length > 1) {
      history.back();
    } else {
      this.router.transitionTo('agendas');
    }
  }

  @action
  async markForSignature(piece, decisionActivity) {
    await this.signatureService.markDocumentForSignature(piece, decisionActivity);
  }

  @action
  async unmarkForSignature(piece) {
    await this.signatureService.unmarkDocumentForSignature(piece);
  }

  @action
  async didDeletePiece(piece) {
    const previousPiece = await piece.previousPiece;
    if (this.pieceIsFromDecision) {
      const decisionActivity = await piece.decisionActivity;
      await this.fileService.deletePiece(piece);
      await this._didDeletePieceFromDecision(decisionActivity, previousPiece);
    } else {
      // Fetch linked agendaitem before the piece is deleted and we lose the link
      const agendaitem = await this.store.queryOne('agendaitem', {
        filter: {
          'pieces': {
            ':id:': piece.id,
          },
          ':has-no:next-version': true,
        },
      });
      await this.fileService.deletePiece(piece);
      if (agendaitem) {
        await this._didDeletePieceFromAgendaitem(agendaitem, piece);
      }
    }

    if (previousPiece?.id) {
      this.router.transitionTo('document', previousPiece.id);
    } else {
      this.router.transitionTo('agendas');
    }
  }

  async _didDeletePieceFromAgendaitem(agendaitem, piece) {
    const documentContainer = await piece.documentContainer;
    if (documentContainer) {
      const pieces = await documentContainer.pieces;
      if (pieces.length && agendaitem) {
        await restorePiecesFromPreviousAgendaitem(agendaitem, documentContainer);
      }
    }
  }

  async _didDeletePieceFromDecision(decisionActivity, previousPiece) {
    if (previousPiece) {
      decisionActivity.report = previousPiece;
      await decisionActivity.save();
    } // else no previous version available. DecisionActivity no longer has a report
  }
}
