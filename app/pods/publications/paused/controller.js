import Controller from '@ember/controller';

export default class PublicationsPausedController extends Controller {
  get publicationsPaused() {
    if (this.model) {
      return this.model.filter((publication) => publication.isPaused);
    }

    return [];
  }
}
