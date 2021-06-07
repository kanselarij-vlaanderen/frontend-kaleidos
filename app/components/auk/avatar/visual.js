import Component from '@glimmer/component';

/**
 * @argument size {String}
 * @argument icon {String}
 * @argument image {String}
 * @argument name {String}: Determines the name of the individual depicted (concerning accessibility)
 */
export default class AvatarVisual extends Component {
  get type() {
    if (this.args.icon) {
      return 'auk-avatar--default';
    } else if (this.args.image) {
      return 'auk-avatar--img';
    }
    return null;
  }

  get size() {
    if (this.args.size) {
      return `auk-avatar--${this.args.size}`;
    }
    return null;
  }

  get name() {
    if (this.args.name) {
      return this.args.name;
    }
    return 'Avatar';
  }
}
