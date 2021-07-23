import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class CaseController extends Controller {
  @tracked isViaCouncilOfMinisters;
}
