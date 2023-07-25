import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class MandateesSecretaryPanelEditComponent extends Component {
  /**
   * @argument onCancel
   * @argument onSave
   * @argument {Date} referenceDate: Date to get active Mandatees for
   */

  @tracked secretary;

  VISIBLE_ROLES = [
    CONSTANTS.MANDATE_ROLES.SECRETARIS,
    CONSTANTS.MANDATE_ROLES.WAARNEMEND_SECRETARIS,
  ];

  save = task(async () => {
    await this.args.onSave?.(this.secretary);
    this.isEditing = false;
  });

  @action
  cancel() {
    this.args.onCancel?.();
  }

  get selectedSecretary() {
    if (this.secretary) {
      return this.secretary;
    } else {
      return this.args.secretary;
    }
  }
}
