import Component from '@glimmer/component';

export default class Sidebar extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-sidebar--${this.args.skin}`;
    }
    return 'auk-sidebar--gray-100';
  }

  get position() {
    if (this.args.position) {
      return `auk-sidebar--${this.args.position}`;
    }
    return 'auk-sidebar--left';
  }
}
