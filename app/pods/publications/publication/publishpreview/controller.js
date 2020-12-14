import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationPublishPreviewController extends Controller {
  // properties for making the design
  @tracked withdrawn = true;
  @tracked testDate = new Date();


  get publishPreviewActivities() {
    const publishPreviewActivities = this.model.publishPreviewActivities.map((activity) => activity);
    return publishPreviewActivities;
  }

  @action
  async cancelExistingTranslationActivity() {
    alert('this action is implemented in another ticket');
  }

  @action
  async checkExistingTranslationActivity() {
    alert('this action is implemented in another ticket');
  }

  @action
  addPublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  deletePublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  editPublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  addCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  deleteCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  editCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  async showPieceViewer(piece) {
    window.open(`/document/${(await piece).get('id')}`);
  }
}
