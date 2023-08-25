import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SignaturesSelectSecretaryModalComponent extends Component {
  @service mandatees;

  @tracked selectedSecretary;
  @tracked secretaryOptions = [];
  @tracked referenceDate;

  VISIBLE_ROLES = [
    CONSTANTS.MANDATE_ROLES.SECRETARIS,
    CONSTANTS.MANDATE_ROLES.WAARNEMEND_SECRETARIS,
  ];

  constructor() {
    super(...arguments);
    this.selectedSecretary = this.args.selected[0] ?? null;
    this.referenceDate = this.args.referenceDate || new Date();
    this.loadSecretaries.perform();
  }

  @action
  onChangeSecretary(selectedSecretary) {
    this.selectedSecretary = selectedSecretary;
  }

  @action
  saveSelected() {
    this.args.onConfirm?.(this.selectedSecretary);
  }

  @task
  *loadSecretaries() {
    this.secretaryOptions = yield this.mandatees.getMandateesActiveOn.perform(
      this.referenceDate,
      undefined,
      undefined,
      this.VISIBLE_ROLES
    );
  }
}
