import Component from '@glimmer/component';

/**
 *
 * @argument {String} message
 * @argument {boolean} bordered
 */
export default class EmptyState extends Component {
  get bordered() {
    if (this.args.bordered) {
      return 'auk-empty-state--bordered';
    }
    return '';
  }
}
