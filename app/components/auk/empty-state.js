import Component from '@glimmer/component';

/**
 *
 * @argument {String} message
 * @argument {String}
 */
export default class EmptyState extends Component {
  get bordered() {
    if (this.args.bordered) {
      return 'auk-empty-state--bordered';
    }
    return '';
  }
}
