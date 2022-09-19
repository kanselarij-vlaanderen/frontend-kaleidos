import Component from '@glimmer/component';

/**
 * @argument size {String}: "regular", "large" or "auto" ("regular" is the default size)
 * @argument borderless {Boolean}
 */
export default class Header extends Component {
  get sizeClass() {
    if (this.args.size) {
      return `auk-panel__header--${this.args.size}`;
    }
    return 'auk-panel__header--regular';
  }

  get borderless() {
    if (this.args.borderless) {
      return 'auk-panel__header--borderless';
    }
    return null;
  }
}
