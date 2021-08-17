import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DocumentController extends Controller {
  @service router;
  @tracked transition;

  @action
  transitionBack() {
    // If no route where you returned from go to the home page
    console.log(this.transition);
    if (this.transition) {
      this.router.transitionTo(this.transition.from);
    } else {
      this.router.transitionTo('agendas');
    }
  }
}
