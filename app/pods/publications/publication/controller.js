import Controller from '@ember/controller';

export default class PublicationController extends Controller {
  get getShortTitle() {
    const caze = this.model.get('case');
    return caze.get('shortTitle');
  }

  get getPublicationNumber() {
    return `PUBLICATIE ${this.model.get('publicationNumber')}`.toString().toUpperCase();
  }
}
