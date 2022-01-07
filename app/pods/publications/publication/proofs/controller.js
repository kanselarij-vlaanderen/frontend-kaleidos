import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PublicationsPublicationProofController extends Controller {
  @service intl;
  @service toaster;
  @tracked proofRequestStage = "";
  @tracked selectedPieceRows = [];

  get selectedPieces() {
    return this.selectedPieceRows.map((row) => row.piece);
  }

  @action
  async toggleFinishProof(event) {
    const proofIsFinished = event.target.checked;
    if (proofIsFinished) {
      this.model.endDate = new Date();
    } else {
      this.model.endDate = null;
    }
    await this.model.save();
    this.toaster.success(this.intl.t('successfully-saved'));
  }

  @action
  async saveSidebarProperty(modifiedObject) {
    await modifiedObject.save();
  }

  @tracked showProofUploadModal = false;
  @tracked isProofRequestModalOpen = false;


  @action
  openProofUploadModal() {
    this.showProofUploadModal = true;
  }

  @action
  closeProofUploadModal() {
    this.showProofUploadModal = false;
  }

  @action
  openProofRequestModal(stage) {
    this.proofRequestStage = stage;
    this.isProofRequestModalOpen = true;
  }

  @action
  closeProofRequestModal() {
    this.isProofRequestModalOpen = false;
  }
}
