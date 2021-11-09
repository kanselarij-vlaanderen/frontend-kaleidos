import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CaseController extends Controller {
  @tracked isViaCouncilOfMinisters;
  @tracked case_;

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = await this.case_.governmentAreas;

    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.case_.save();
  }
}
