import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { restorePiecesFromPreviousAgendaitem } from 'frontend-kaleidos/utils/documents';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class DocumentController extends Controller {
  @service router;
  @service store;
  @service signatureService;

  @tracked decisionActivity;

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
    if (isPresent(this.decisionActivity)) {
      await deletePiece(piece);
      await this._didDeletePieceFromDecision(this.decisionActivity, previousPiece);
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
      await deletePiece(piece);
      if (agendaitem) {
        await this._didDeletePieceFromAgendaitem(agendaitem, previousPiece);
      }
    }

    if (previousPiece?.id) {
      this.router.replaceWith('document', previousPiece.id);
    } else {
      this.transitionBack();
    }
  }

  async _didDeletePieceFromAgendaitem(agendaitem, previousPiece) {
    if (previousPiece) {
      const documentContainer = await previousPiece.documentContainer;
      await restorePiecesFromPreviousAgendaitem(agendaitem, documentContainer);
    }
  }

  async _didDeletePieceFromDecision(decisionActivity, previousPiece) {
    if (previousPiece) {
      decisionActivity.report = previousPiece;
      await decisionActivity.save();
    } // else no previous version available. DecisionActivity no longer has a report
  }
}
