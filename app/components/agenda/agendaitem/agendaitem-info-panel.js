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
export default class AgendaitemInfoPanel extends Component {
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
