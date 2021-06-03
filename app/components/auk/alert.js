import Component from '@glimmer/component';

/**
 *
 * @argument skin {String}: value can be (empty, default), "succes", "warning", "error", "loading" (not yet implemented in our code below)
 * @argument icon {String}
 * @argument size {String}
 * @argument title {String}
 * @argument message {String}: Determines the text of the alert. This is the secondary text if a title is present.
 * @argument isClosable {Boolean}: Determines whether the alert is closable.
 */
export default class Alert extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-alert--${this.args.skin}`;
    }
    return 'auk-alert--default';
  }

  get icon() {
    if (this.args.icon) {
      return this.args.icon;
    } else if (this.args.skin) {
      if (this.args.skin === 'success') {
        return 'check';
      } else if (this.args.skin === 'warning' || this.args.skin === 'error') {
        return 'alert-triangle';
      }
    }
    return 'circle-info';
  }
}
