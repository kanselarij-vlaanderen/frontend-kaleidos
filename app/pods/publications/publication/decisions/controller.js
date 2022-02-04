import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsPublicationDecisionsController extends Controller {
  @tracked publicationFlow;
  @tracked isViaCouncilOfMinisters;

  @action
  refreshModel() {
    this.send('refresh');
  }
}
