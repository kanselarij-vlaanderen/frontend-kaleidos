import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ToTreatController extends Controller {
  @service publicationService;
  @tracked showLoader = false;

  @action
  documentsAmount() {
    return '99';
  }

  @action
  caseHasPublication() {
    return false;
  }

  @action
  caseGetPublicationId() {
    return 1;
  }

  @action
  // eslint-disable-next-line no-unused-vars
  async startPublication(_case) {
    this.set('showLoader', true);
    // TODO what publication number to start with here?
    // Defaulted to 0.
    const newPublication = await this.publicationService.createNewPublication(0, _case);
    this.set('showLoader', false);
    this.transitionToRoute('publications.publication.case', newPublication.get('id'));
  }
}
