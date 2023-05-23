import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
/**
 * @argument subcase
 * @argument meeting
 * @argument allowEditing
 */
export default class SubcaseTitlesPanel extends Component {
  @tracked isEditing = false;
  @tracked startEditingConfidential = false;

  @action
  startEditing() {
    this.isEditing = true;
    this.startEditingConfidential = !!this.args.subcase.confidential;
  }

  @action
  cancelEditing() {
    this.isEditing = false;
  }

  @action
  stopEditing() {
    this.isEditing = false;
  }
}
