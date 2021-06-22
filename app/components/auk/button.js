import Component from '@glimmer/component';

/**
 *
 * @argument skin {String}: possible values are:
 *  "primary", "secondary" (default), "tertiary", "borderless", "muted-borderless",
 *  "danger-primary", "danger-secondary", "danger-tertiary", "danger-borderless", "danger-hover"
 * @argument layout {String}
 * @argument disabled {Boolean}
 * @argument loading {Boolean}: Show the button in a loading state. Overrides most other arguments.
 * @argument size {String}
 * @argument block {Boolean}
 */
export default class Button extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-button--${this.args.skin}`;
    }
    return 'auk-button--secondary';
  }

  get layout() {
    if (this.args.layout === 'icon-only') {
      // TODO: Is this argument unnecessary? Could this be determined from existence of @icon && !has-block?
      return 'auk-button--icon';
    }
    return null;
  }

  get disabled() {
    if (this.args.disabled) {
      return 'auk-button--disabled';
    }
    return null;
  }

  get size() {
    if (this.args.size === 'small') {
      return 'auk-button--size-s';
    }
    return null;
  }

  get block() {
    if (this.args.block) {
      return 'auk-button--block';
    }
    return null;
  }
}
