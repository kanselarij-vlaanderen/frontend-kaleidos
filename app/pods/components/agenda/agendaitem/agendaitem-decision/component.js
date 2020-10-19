import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaitemDecisionComponent extends Component {
  @service currentSession;

  @tracked isEditing = false;
  @tracked isVerifyingDelete = null;
  @tracked treatmentToDelete = null;

  @action
  openEditingWindow() {
    this.isEditing = true;
  }

  @action
  closeEditingWindow() {
    this.isEditing = false;
  }

  @action
  promptDeleteTreatment(treatment) {
    this.treatmentToDelete = treatment;
    this.isVerifyingDelete = true;
  }

  @action
  async deleteTreatment() {
    await this.treatmentToDelete.destroyRecord();
    if (this.args.onDeleteTreatment) {
      await this.args.onDeleteTreatment(this.treatmentToDelete);
    }
    this.isVerifyingDelete = false;
  }

  @action
  cancel() {
    this.treatmentToDelete = null;
    this.isVerifyingDelete = false;
  }

  @action
  async addPiece(piece) {
    await piece.save();
  }
}
