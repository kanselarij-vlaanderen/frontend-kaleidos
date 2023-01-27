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
 * @param onVerify {Function}
 * @param onCancel {Function}
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

  get buttonTypeOrDanger() {
    return this.args.buttonType ?? 'danger';
  }


  get showDestructiveIcon() {
    return this.buttonTypeOrDanger !== 'warning';
  }

  get isAlertButton() {
    return this.buttonTypeOrDanger === 'danger';
  }

  @action
  focus(element) {
    this.element = element;
    this.element.querySelector('[role="dialog"]').focus();
  }

  @action
  keyDown(event) {
    if (event.key === 'Escape') {
      this.args.onCancel();
    }
  }
}
