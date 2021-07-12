import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PublicationsPublicationProofController extends Controller {
  @action
  async toggleFinishProof(event) {
    const proofIsFinished = event.target.checked;
    if (proofIsFinished) {
      this.model.endDate = new Date();
    } else {
      this.model.endDate = null;
    }
    this.model.save();
  }
}
