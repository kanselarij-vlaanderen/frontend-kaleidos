import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SignaturesSignFlowDocumentsController extends Controller {
  @service router;

  @action
  navigateToOverview() {
    this.router.transitionTo('signatures.index');
  }
}
