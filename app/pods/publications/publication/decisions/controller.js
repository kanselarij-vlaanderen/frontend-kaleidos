import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class PublicationsPublicationDecisionsController extends Controller {
  @tracked publicationFlow;
  @tracked isViaCouncilOfMinisters;
}
