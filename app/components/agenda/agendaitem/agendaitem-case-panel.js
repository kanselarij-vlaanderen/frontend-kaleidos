import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
/**
 * @argument subcase
 * @argument agendaitem
 * @argument agenda
 * @argument newsItem
 * @argument allowEditing
 */
export default class AgendaitemCasePanel extends Component {
  @tracked isEditing = false;
  @tracked isEditingCase = false;

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

  @action
  startEditingCase() {
    this.isEditingCase = true;
  }

  @action
  cancelEditingCase() {
    this.isEditingCase = false;
  }

  @action
  stopEditingCase() {
    this.isEditingCase = false;
  }
}
