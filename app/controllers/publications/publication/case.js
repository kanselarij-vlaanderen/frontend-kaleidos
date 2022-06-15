import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CaseController extends Controller {
  @tracked isViaCouncilOfMinisters;
  @tracked _case;

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = await this._case.governmentAreas;

    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this._case.save();
  }
}
