import Component from '@glimmer/component';

/**
 *
 * @argument text {String}
 * @argument skin {String} can be 'danger', 'success', 'warning'
 * @argument icon {String}
 */
export default class FormHelp extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-form-help-text--${this.args.skin}`;
    }
    return null;
  }
}
