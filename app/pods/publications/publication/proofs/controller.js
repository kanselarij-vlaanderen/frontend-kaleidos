import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PublicationsPublicationProofController extends Controller {
  @action
  async toggleFinishProof(event) {
    const translationIsFinished = event.target.checked;
    if (translationIsFinished) {
      const now = new Date();
      this.model.endDate = now;
      this.model.save();
      this.publicationFlow.closingDate = now;
      this.model.save();
    } else {
      this.model.endDate = null;
      this.model.save();
    }
  }
}
