import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PublicationsPublicationTranslationsController extends Controller {
  @action
  toggleFinishTranslation(event) {
    const translationIsFinished = event.target.checked;
    if (translationIsFinished) {
      this.model.endDate = new Date();
    } else {
      this.model.endDate = null;
    }
    this.model.save();
  }
}
