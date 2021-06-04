import Component from '@glimmer/component';

/**
 * @argument {String} name: au-kaleidos-icons name (without prefix)
 * @argument {String} size: Possible values are 'small', 'large'
 * @argument {String} iconSkinColor: Possible values are 'muted', 'warning', 'primary', 'success', 'danger'
 * @argument {Boolean} grab: Make the grab-hand appear on hover
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

  get skin() {
    if (this.args.iconSkinColor) {
      return `${this.baseClass}--${this.args.iconSkinColor}`;
    }
    return null;
  }
}
