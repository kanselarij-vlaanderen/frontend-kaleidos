import Component from '@glimmer/component';
import { isPresent } from '@ember/utils';

/**
 * Modal footer. By default yields a cancel button on the left and a yield block on the right.
 * @argument {Boolean} custom: Allow the entire content of the footer to be a yield block
 * @argument {Function} onCancel: Action fired when pressing the cancel button
 * @argument {Boolean} cancelDisabled: Determines if the cancel button inside the header is disabled
 * @argument {Boolean} bordered: Determines if the footer has a top border
 */
export default class ModalFooter extends Component {
  get bordered() {
    return isPresent(this.args.bordered) ? this.args.bordered : true;
  }
}
