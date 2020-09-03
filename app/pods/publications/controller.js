import Controller from '@ember/controller';

export default class PublicationsController extends Controller {
  get amountInProgress() {
    if (this.model) {
      return this.model.filter((publication) => !publication.isDone).length;
    }

    return 0;
  }

  get amountDone() {
    if (this.model) {
      return this.model.filter((publication) => publication.isDone).length;
    }

    return 0;
  }
}
