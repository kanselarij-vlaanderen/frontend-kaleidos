import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CaseController extends Controller {
  @tracked isViaCouncilOfMinisters;
  @tracked decisionmakingFlow;

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = await this.decisionmakingFlow.governmentAreas;

    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.decisionmakingFlow.save();
  }
}
