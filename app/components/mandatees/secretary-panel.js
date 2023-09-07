import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class MandateesSecretaryPanelComponent extends Component {
  /**
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

  save = task(async (secretary) => {
    await this.args.onSave?.(secretary);
    this.isEditing = false;
  });
}
