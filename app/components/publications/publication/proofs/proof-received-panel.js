import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @argument {proofingActivity}
 * @argument {publicationSubcase}
 */
export default class PublicationsPublicationProofProofReceivedPanel extends Component {
  @tracked showEditProofModal = false;

  @action
  openEditProofModal() {
    this.showEditProofModal = true;
  }

  @action
  closeEditProofModal() {
    this.showEditProofModal = false;
  }

  @action
  async saveEdit(proofEdit) {
    await this.args.onSaveEditReceivedProof(proofEdit);
    this.showEditProofModal = false;
  }
}
