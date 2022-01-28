import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CaseController extends Controller {
  @service currentPublicationFlow
  @tracked isViaCouncilOfMinisters;

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = await this.model.governmentAreas;

    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.model.save();
  }
}
