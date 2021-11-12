import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SignaturesSignFlowDocumentsController extends Controller {
  @tracked signFlow;

  @action
  close() {
    // If no route where you returned from go to the home page
    if (history.length > 1) {
      history.back();
    } else {
      this.router.transitionTo('');
    }
  }
}
