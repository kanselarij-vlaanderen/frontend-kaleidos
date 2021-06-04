import Component from '@glimmer/component';

/**
 * @argument {String} name: au-kaleidos-icons name (without prefix)
 * @argument {String} size: Possible values are (empty, default), "small", "large"
 * @argument {String} skin: Possible values are "muted", "muted-dark", "warning", "primary", "success", "success-dark", "danger"
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
    if (this.args.skin) {
      return `${this.baseClass}--${this.args.skin}`;
    }
    return null;
  }
}
