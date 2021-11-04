import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CaseController extends Controller {
  @tracked isViaCouncilOfMinisters;

  @action
  async saveGovernmentFields(newGovernmentFields) {
    const governmentFields = await this.model.governmentFields;

    governmentFields.clear();
    governmentFields.pushObjects(newGovernmentFields);
    await this.model.save();
  }

}
