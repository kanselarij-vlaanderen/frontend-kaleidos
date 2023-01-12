import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * @param message {string}
 * @param buttonText {string}
 * @param clearAction {Function}
 */
export default class ChangesAlert extends Component {
  @action
  clearAction() {
    this.args.clearAction();
  }
}
