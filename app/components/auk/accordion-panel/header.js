import Component from '@glimmer/component';

/**
 * @argument title {String}
 * @argument subtitle {String}
 * @argument size {String}: "regular", "large" ("regular" is the default size)
 */
export default class Header extends Component {
  get sizeClass() {
    if (this.args.size) {
      return `auk-accordion-panel__header--${this.args.size}`;
    }
    return 'auk-accordion-panel__header--regular';
  }
}
