import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { restorePiecesFromPreviousAgendaitem } from 'frontend-kaleidos/utils/documents';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DocumentController extends Controller {
  @service router;
  @service store;
  @service intl;
  @service toaster;
  @service signatureService;

  @tracked decisionActivity;
  queryParams = [
    {
      tab: {
        type: 'string',
      },
    },
  ];
  @tracked tab = 'details';
  @tracked isLoadingModel;

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
  tabChanged(tabName){
    this.tab = tabName;
  }

  @action
  setSelectedVersion(piece) {
    this.router.replaceWith(
      'document',
      piece.id,
      { queryParams: { tab: this.intl.t('versions')}}
    );
  }

  @action
  async didDeletePiece(piece) {
    const previousPiece = await piece.previousPiece;

    const signMarkingActivity = await piece.belongsTo('signMarkingActivity').reload();
    if (signMarkingActivity) {
      const signSubcase = await signMarkingActivity?.signSubcase;
      const signFlow = await signSubcase?.signFlow;
      const status = await signFlow?.belongsTo('status').reload();
      if (status.uri !== CONSTANTS.SIGNFLOW_STATUSES.MARKED) {
        this.router.refresh('document');
        this.toaster.error(
          this.intl.t('sign-flow-was-sent-while-you-were-editing-could-not-delete'),
          this.intl.t('changes-could-not-be-saved-title'),
        );
        return;
      }
      // dont use this.decisionActivity since it is loaded for decision report
      const decisionActivity = await signFlow.decisionActivity;
      await this.signatureService.removeSignFlow(signFlow);
      await this.signatureService.markDocumentForSignature(previousPiece, decisionActivity);
    }

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
