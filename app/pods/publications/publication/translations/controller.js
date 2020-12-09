import Controller from '@ember/controller';
import { action } from '@ember/object';
export default class PublicationTranslationController extends Controller {
  get activities() {
    console.log('MODEL', this.model);
    const activities = this.model.activities.map((activity) => activity);
    console.log('ACTIVITIES', activities);
    return activities;
  }

  @action
  async usedPieces(activity) {
    const pieces = await activity.usedPieces();
    console.log('PIECES', pieces);
  }

  @action
  async cancelExistingTranslationActivity() {
    alert('this action is implemented in another ticket');
  }

  @action
  async checkExistingTranslationActivity() {
    alert('this action is implemented in another ticket');
  }
}
