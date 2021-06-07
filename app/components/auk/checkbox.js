import Component from '@glimmer/component';

/**
 *
 * Example usage:
 * ```
 * <Auk:Checkbox @label="A checkbox" {{on "input" this.toggleCheckbox}}
 * ```
 * ```
 * @action
 * toggleCheckbox(event) {
 *   console.log('New checkbox value=', event.target.checked);
 * }
 * ```
 *
 * @argument checked {Boolean}
 * @argument label {String}
 */
export default class Checkbox extends Component {}
