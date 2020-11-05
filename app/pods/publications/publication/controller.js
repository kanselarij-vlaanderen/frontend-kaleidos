import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PublicationController extends Controller {
  @tracked collapsed = true;
  @tracked publicationNumber = this.model.get('publicationNumber');
  @tracked translationDate = this.model.get('publicationBefore');
  @tracked publicationDate = this.model.get('translationBefore');
  @tracked publicationStatus;
  @tracked publicationForm;

  get getShortTitle() {
    const caze = this.model.get('case');
    return caze.get('shortTitle');
  }

  get getPublicationNumber() {
    return `PUBLICATIE ${this.model.get('publicationNumber')}`.toString()
      .toUpperCase();
  }

  @action
  setPublicationNumber(event) {
    this.publicationNumber = event.target.value;
  }

  @action
  setPublicationDate(event) {
    this.publicationDate = event.target.value;
  }

  @action
  setTranslationDate(event) {
    this.translationDate = event.target.value;
  }

  @action
  setPublicationStatus(event) {
    this.publicationStatus = event.target.value;
  }

  @action
  setPublicationForm(event) {
    this.publicationForm = event.target.value;
  }

  @action
  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }
}
