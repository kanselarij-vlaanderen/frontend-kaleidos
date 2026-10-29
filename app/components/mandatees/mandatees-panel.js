import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class MandateesMandateesPanelComponent extends Component {
  /**
   * @argument mandatees
   * @argument submitter
   * @argument allowEditing
   * @argument onSave
   * @argument {Date} referenceDate: Date to get active Mandatees for
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

  save = task(async (mandateeData) => {
    if (this.args.onSave) {
      await this.args.onSave(mandateeData);
    }
    this.isEditing = false;
  });
}
