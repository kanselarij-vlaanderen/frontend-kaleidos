import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class AlertDialog extends Component {
  /**
   * Use:
   * consistent dialog for confirming a dangerous action will be performed.
   * @type {{
   *  use?: 'delete' // configuration shortcut
   *  confirmIcon: string
   *  confirmText: string
   *  onCancel(): Promise?
   *  onConfirm(): Promise?
   * }}} args
   */
  args = this.args; // just for code editor

  @service intl;

  get isLoading() {
    return this.cancel.isRunning || this.confirm.isRunning;
  }

  get isAlertConfirm() {
    return this.args.use === 'delete';
  }

  get confirmIcon() {
    if (this.args.confirmIcon) {
      return this.args.confirmIcon;
    }

    if (this.args.use === 'delete') {
      return 'trash';
    }

    return undefined;
  }

  get confirmText() {
    if (this.args.confirmText) {
      return this.args.confirmText;
    }

    if (this.args.use === 'delete') {
      return this.intl.t('delete');
    }

    return undefined;
  }

  @task
  *cancel() {
    yield this.args.onCancel();
  }

  @task
  *confirm() {
    yield this.args.onConfirm();
  }
}
