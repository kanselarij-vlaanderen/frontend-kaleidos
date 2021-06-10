import Component from '@glimmer/component';

/**
 *
 * @argument {Boolean} isCollapsed
 * @argument {String} skin
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

  get position() {
    const defaultPosition = 'left';
    if (this.args.position) {
      return `${this.baseClass}--${this.args.position}`;
    }
    return `${this.baseClass}--${defaultPosition}`;
  }
  // TODO css was missing, check later
}
