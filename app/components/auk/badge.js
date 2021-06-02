import Component from '@glimmer/component';

/**
 * @argument skin {String}: can be: (empty, default), "succes", "warning", "error", "white"
 * @argument size {String}: "small", "regular", "large" ("regular" is the default size)
 * @argument icon {String}
 */
export default class Badge extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-badge--${this.args.skin}`;
    }
    return 'auk-badge--default';
  }

  get size() {
    if (this.args.size) {
      return `auk-badge--${this.args.size}`;
    }
    return 'auk-badge--regular';
  }
}
