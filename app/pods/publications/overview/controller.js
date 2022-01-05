import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PublicationsOverviewController extends Controller {
  @service publicationService;

  @tracked isShowPublicationModal = false;

  @action
  showPublicationModal() {
    this.isShowPublicationModal = true;
  }

  @action
  closePublicationModal() {
    this.isShowPublicationModal = false;
  }

  @action
  async saveNewPublication(publication) {
    const newPublication = await this.publicationService.createNewPublicationWithoutMinisterialCouncil(publication, {
      decisionDate: publication.decisionDate,
    });
    this.closePublicationModal();
    this.transitionToRoute('publications.publication', newPublication.get('id'));
  }
}
