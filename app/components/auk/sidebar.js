import Component from '@glimmer/component';

/**
 *
 * @argument {Boolean} isCollapsed
 * @argument {String} skin: Skin can be "gray-100", "gray-200" or "white"
 * @argument {String} size: Size can be (default, none), "small", "large", "xlarge"
 * @argument {String} position: Position can be "left" or "right"
 */
export default class Sidebar extends Component {
  baseClass = 'auk-sidebar';
  get skin() {
    const defaultSkin = 'gray-100';
    if (this.args.skin) {
      return `${this.baseClass}--${this.args.skin}`;
    }
    return `${this.baseClass}--${defaultSkin}`;
  }

  get size() {
    if (this.args.size) {
      return `${this.baseClass}--${this.args.size}`;
    }
    return null;
  }

  get position() {
    const defaultPosition = 'left';
    if (this.args.position) {
      return `${this.baseClass}--${this.args.position}`;
    }
    return `${this.baseClass}--${defaultPosition}`;
  }
  // TODO css was missing, check later
}
