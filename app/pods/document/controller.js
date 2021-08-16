import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DocumentController extends Controller {
  @service router;
  @tracked transition;

  @action
  transitionBack() {
    // If no route where you returned from go to the home page
    // if (this.transition) {
    //   this.router.transitionTo(this.transition);
    // } else {
    // }
    this.router.transitionTo('agendas');
  }
}
