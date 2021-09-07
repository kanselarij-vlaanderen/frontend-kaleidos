import Component from '@glimmer/component';

/**
 *
 * Example usage:
 * ```
 * <Auk:Toggle {{on "input" this.changeToggle}} />
 * ```
 * ```
 * @action
 * changeToggle(event) {
 *   console.log('New toggle value=', event.target.checked);
 * }
 * ```
 *
 * @argument checked {Boolean}
 * @argument disabled {Boolean}
 */
export default class Toggle extends Component {}
