import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PublicationController extends Controller {
  @service router;
  @tracked isViaCouncilOfMinisters;

  @action
  refreshRoute() {
    this.router.refresh('publications.publication');
  }
}
