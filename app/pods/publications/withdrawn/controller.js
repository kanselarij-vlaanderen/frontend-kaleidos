import Controller from '@ember/controller';

export default class PublicationsWithdrawnController extends Controller {
  get publicationsWithdrawn() {
    if (this.model) {
      return this.model.filter((publication) => publication.inProgress);
    }

    return [];
  }
}
