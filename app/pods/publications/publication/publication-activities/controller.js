import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PublicationsPublicationPublicationActivitiesController extends Controller {
  @tracked publicationFlow;

  @action
  async savePublicationInfo(publicationInfo) {
    this.publicationFlow.mode = publicationInfo.mode;
    await this.publicationFlow.save();
    this.model.targetEndDate = publicationInfo.targetEndDate;
    await this.model.save();
  }
}
