import Controller from '@ember/controller';
import { action } from '@ember/object';
export default class PublicationTranslationController extends Controller {
  get activities() {
    return this.model.activities.map((activity) => activity);
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
