import Component from '@glimmer/component';

/**
 *
 * Example usage:
 * ```
 * <Auk::Checkbox @label="A checkbox" {{on "input" this.toggleCheckbox}} />
 * ```
 * ```
 * @action
 * toggleCheckbox(event) {
 *   console.log('New checkbox value=', event.target.checked);
 * }
 * ```
 *
 * @argument checked {Boolean}
 * @argument indeterminate {Boolean}
 * @argument disabled {Boolean}
 * @argument label {String}
 * @argument labelSkin {String}
 */
export default class Checkbox extends Component {
  get labelSkinClass() {
    if (this.args.labelSkin) {
      return `auk-checkbox__label--${this.args.labelSkin}`;
    }
    return '';
  }
}
