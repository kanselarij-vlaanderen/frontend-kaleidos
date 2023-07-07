import Component from '@glimmer/component';
import { action } from '@ember/object';
/**
 * @param title {string} Optional. The title of the modal. Is overriden by a :title block
 * @param message {string} Optional. The message displayed in the body of the modal. Is overriden by a :body block
 * @param modalOpen {boolean} Whether the modal should be shown or not
 * @param onConfirm {Function} Function to run when clicking the confirm button
 * @param onCancel {Function} Function to run when clicking the cancel button/closing the modal
 * @param confirmMessage {string} Text to display in the confirm button
 * @param cancelMessage {string} Text to display in the cancel button
 * @param confirmIcon {string} Icon to display inside the confirm button
 * @param alert {boolean} Whether the confirm button is in an alert state (i.e. red or blue)
 * @param disabled {boolean} Whether the confirm button is in a disabled state
 * @param loading {boolean} Whether the confirm button is in a loading state (and also disabled)
 */
export default class ConfirmationModalComponent extends Component {

  @action
  cancel () {
    if (!this.args.loading) {
      this.args.onCancel();
    }
  }
}
