import Component from '@glimmer/component';

/**
 * @argument {String} name: au-kaleidos-icons name (without prefix)
 * @argument {String} size: Possible values are (empty, default), "small", "large"
 * @argument {String} skin: Possible values are "muted", "muted-dark", "warning", "primary", "success", "success-dark", "danger"
 */
export default class Icon extends Component {
  baseClass = 'auk-icon';

  get size() {
    const modifier = this.args.size || 'default';
    return `${this.baseClass}--${modifier}`;
  }

  get skin() {
    if (this.args.skin) {
      return `${this.baseClass}--${this.args.skin}`;
    }
    return null;
  }
}
