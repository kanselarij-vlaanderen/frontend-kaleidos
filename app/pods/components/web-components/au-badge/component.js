import Component from '@glimmer/component';

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
    return '';
  }
}
