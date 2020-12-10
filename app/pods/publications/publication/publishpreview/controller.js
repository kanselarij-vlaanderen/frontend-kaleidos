import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationPublishPreviewController extends Controller {
  // properties for making the design
  @tracked withdrawn = true;
  @tracked testDate = new Date();

  get activities() {
    console.log('Publishing model:', this.model);
    const publishPreviewActivities = this.model.publishPreviewActivities.map((activity) => activity);
    return publishPreviewActivities;
  }

  // @action
  // async usedPieces(activity) {
  //   const pieces = await activity.usedPieces();
  //   console.log('PIECES', pieces);
  // }

  @action
  async cancelExistingTranslationActivity() {
    alert('this action is implemented in another ticket');
  }

  @action
  async checkExistingTranslationActivity() {
    alert('this action is implemented in another ticket');
  }

  @action
  addProof() {
    alert('this action is implemented in another ticket');
  }

  @action
  deleteProof() {
    alert('this action is implemented in another ticket');
  }

  @action
  editProof() {
    alert('this action is implemented in another ticket');
  }

  @action
  addImprovement() {
    alert('this action is implemented in another ticket');
  }

  @action
  deleteImprovement() {
    alert('this action is implemented in another ticket');
  }

  @action
  editImprovement() {
    alert('this action is implemented in another ticket');
  }
}
