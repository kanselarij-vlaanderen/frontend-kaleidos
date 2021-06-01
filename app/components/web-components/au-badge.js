import Component from '@glimmer/component';

export default class Badge extends Component {
  /**
   * skin can be:
   * (empty, default)
   * succes
   * warning
   * error
   * white
   */
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
