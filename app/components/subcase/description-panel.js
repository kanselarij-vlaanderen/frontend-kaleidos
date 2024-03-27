import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SubcaseDescriptionPanelComponent extends Component {
  /**
   * @argument subcase
   */
  @tracked isEditing = false;

  @action
  startEditing() {
    this.isEditing = true;
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