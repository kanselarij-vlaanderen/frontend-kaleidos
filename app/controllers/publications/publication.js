import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class PublicationController extends Controller {
  @tracked isViaCouncilOfMinisters;
}
