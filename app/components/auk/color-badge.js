import Component from '@glimmer/component';

export default class ColorBadge extends Component {
  /**
   * skin can be:
   * (empty, default)
   * succes
   * warning
   * error
   */
  get skin() {
    if (this.args.skin) {
      return `auk-color-badge--${this.args.skin}`;
    }
    return 'auk-color-badge--default';
  }
}
