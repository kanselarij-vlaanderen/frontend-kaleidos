import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EditCaseComponent extends Component {
  @tracked isLoading = false;

  @action
  async saveChanges() {
    this.isLoading = true;
    await this.args.caseToEdit.save();
    this.args.onClose();
    this.isLoading = false;
  }
}
