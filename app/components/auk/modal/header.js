import Component from '@glimmer/component';
import { isPresent } from '@ember/utils';

/**
 * @argument {String} title
 * @argument {Boolean} resizeable
 * @argument {Boolean} isExpanded
 * @argument {Function} onResize
 * @argument {Boolean} closeable defaults to "true"
 * @argument {Function} onClose
 */
export default class ModalHeader extends Component {
  get closeable() {
    if (isPresent(this.args.closeable)) {
      return this.args.closeable;
    }
    return true;
  }
}
