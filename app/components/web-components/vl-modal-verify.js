import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

/**
 * @param title {string}
 * @param message {string}
 * @param showActions {Boolean}
 * @param showVerify {Boolean}
 * @param buttonType {string}
 * @param buttonText {string}
 * @param isLoading {string}
 * @param verify {Function}
 * @param cancel {Function}
 */
export default class WebComponentsVlModalVerify extends Component {
  @service intl;

  @tracked element;

  get showActions() {
    return this.args.showActions ?? true;
  }

  get showVerify() {
    return this.args.showVerify ?? true;
  }

  get verifyButtonText() {
    return this.intl.t(this.args.buttonText ?? 'delete');
  }

  get showDestructiveIcon() {
    return this.buttonType !== 'warning';
  }

  get buttonType() {
    return this.args.buttonType ?? 'danger';
  }

  get isAlertButton() {
    return this.buttonType === 'danger';
  }

  @action
  focus(element) {
    this.element = element;
    this.element.querySelector('[role="dialog"]').focus();
  }

  @action
  keyDown(event) {
    if (event.key === 'Escape') {
      this.cancel();
    }
  }

  @action
  verify() {
    this.args.verify();
  }

  @action
  cancel() {
    this.args.cancel();
  }
}
