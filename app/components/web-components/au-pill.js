import Component from '@glimmer/component';

export default class Pill extends Component {
  /**
   * skin can be:
   * (empty, default)
   * success
   * danger
   * warning
   */
  get skin() {
    if (this.args.skin) {
      return `auk-pill--${this.args.skin}`;
    }
    return 'auk-pill--default';
  }
  /**
   * layout can be:
   * (empty, default is icon-left)
   * icon-only
   * icon-right
   */
  get layout() {
    if (this.args.layout) {
      return `auk-pill--${this.args.layout}`;
    }
    return '';
  }
}
