import Component from '@glimmer/component';

/**
 * Important, @name should be the icon name without prefix
 */
export default class Icon extends Component {
  baseClass = 'auk-icon';

  get size() {
    const modifier = this.args.size || 'default';
    return `${this.baseClass}--${modifier}`;
  }

  get grab() {
    if (this.args.grab) {
      return 'auk-u-cursor-grab';
    }
    return null;
  }

  /*
    Skins can be:
    - muted
    - warning
    - primary
    - success
    - danger
   */
  get skin() {
    if (this.args.iconSkinColor) {
      return `${this.baseClass}--${this.args.iconSkinColor}`;
    }
    return null;
  }
}
