import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PublicationsController extends Controller {
  @tracked publicationSubcase;

  @action
  async savePublicationInfo(publicationInfo) {
    this.model.mode = publicationInfo.mode;
    await this.model.save();
    this.publicationSubcase.targetEndDate = publicationInfo.targetEndDate;
    await this.publicationSubcase.save();
  }
}
