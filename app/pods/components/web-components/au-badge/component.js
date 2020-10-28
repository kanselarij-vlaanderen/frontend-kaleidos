import Component from '@glimmer/component';

export default class Badge extends Component {
  get skin() {
    if (this.args.skin) {
      return `au2-badge--${this.args.skin}`;
    }
    return 'au2-badge--default';
  }

  get size() {
    if (this.args.size) {
      return `au2-badge--${this.args.size}`;
    }
    return '';
  }
}
