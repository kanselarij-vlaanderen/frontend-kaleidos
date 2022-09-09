import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class CaseController extends Controller {
  governmentAreas;

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = await this.model.governmentAreas;

    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.model.save();
  }
}
