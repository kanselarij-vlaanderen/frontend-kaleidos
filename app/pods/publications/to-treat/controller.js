import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ToTreatController extends Controller {
  @tracked showLoader = false;

  @action
  // eslint-disable-next-line no-unused-vars
  startPublication(_case) {
    this.set('showLoader', true);

    // create publication
    // newPublicationFlow

    // Link to case

    // Show toast

    this.set('showLoader', false);
    // this.transitionToRoute('publications.publication', newPublicationFlow.get('id'));
  }
}
