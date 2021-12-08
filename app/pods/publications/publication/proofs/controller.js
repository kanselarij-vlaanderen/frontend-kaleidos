import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationsPublicationProofController extends Controller {
  @service intl;
  @service toaster;

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
}
