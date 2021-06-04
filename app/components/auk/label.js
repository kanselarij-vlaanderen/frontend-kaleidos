import Component from '@glimmer/component';

/**
 *
 * @argument {Boolean} error: displays the label in an error-state
 */
export default class Label extends Component {
  get class() {
    if (this.args.error) {
      return 'auk-label-error';
    }
    return 'auk-label';
  }
}
