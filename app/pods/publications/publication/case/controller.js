import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CaseController extends Controller {
  @tracked isViaCouncilOfMinisters;

  @action
  async saveSidebarProperty(modifiedObject) {
    await modifiedObject.save();
  }
}
