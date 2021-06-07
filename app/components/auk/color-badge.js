import Component from '@glimmer/component';

/**
 *
 * @argument skin {String}: Possible values are: (empty, default), "succes", "warning", "error"
 */
export default class ColorBadge extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-color-badge--${this.args.skin}`;
    }
    return 'auk-color-badge--default';
  }
}
