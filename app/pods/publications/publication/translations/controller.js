import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PublicationsPublicationTranslationsController extends Controller {
  @tracked translationFinished;

  @action
  toggleFinishTranslation() {
    this.translationFinished = !this.translationFinished;
    if (this.translationFinished) {
      this.model.endDate = new Date();
    } else {
      this.model.endDate = null;
    }
    this.model.save();
  }
}
