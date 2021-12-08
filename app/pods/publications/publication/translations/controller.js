import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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

  @tracked isInEditMode;
  @tracked showError;

  @action
  putInEditMode() {
    this.isInEditMode = true;
  }

  @action
  cancelEdit() {
    this.showError = false;
    this.isInEditMode = false;
  }

  @action
  async saveSidebarProperty(modifiedObject) {
    await modifiedObject.save();
  }

  @tracked showTranslationUploadModal = false;

  @action
  openTranslationUploadModal() {
    this.showTranslationUploadModal = true;
  }

  @action
  closeTranslationUploadModal() {
    this.showTranslationUploadModal = false;
  }
}
