import Controller from '@ember/controller';

export default class PublicationsInProgressController extends Controller {
  get publicationsInProgress() {
    if (this.model) {
      return this.model.filter((publication) => publication.inProgress);
    }

    return [];
  }
}
