import Component from '@glimmer/component';
import { isPresent } from '@ember/utils';

/**
 * @argument {String} title
 * @argument {Boolean} resizeable
 * @argument {Boolean} isExpanded
 * @argument {Function} onResize
 * @argument {Boolean} closeable: Determines wether the modal is closable from the header (e.g. the close (x) button is available). Defaults to "true"
 * @argument {Boolean} closeDisabled: Determines if the close (x) button inside the header is disabled
 * @argument {Function} onClose
 * @argument {Boolean} bordered: Determines if the header has a bottom border
 */
export default class ModalHeader extends Component {
  get closeable() {
    return isPresent(this.args.closeable) ? this.args.closeable : true;
  }

  get bordered() {
    return isPresent(this.args.bordered) ? this.args.bordered : true;
  }
}
