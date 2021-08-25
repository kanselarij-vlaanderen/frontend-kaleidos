import Component from '@glimmer/component';

/**
 * Simple wrapper for Ember's <Input> component. Takes all arguments that <Input> takes.
 *
 * @argument {String} icon
 * @argument {String} type: Possible values are ("text", default), "number". Consider other components for "radio", "checkbox", etc..
 * @argument {Boolean} block
 * @argument {Boolean} width: Possible values are "small, "medium", "large"
 * @argument {Boolean} error
 */
export default class Input extends Component {
  get block() {
    if (this.args.block) {
      return 'auk-input--block';
    }
    return null;
  }

  get width() {
    if (this.args.width) {
      return `auk-input--w-${this.args.width}`;
    }
    return null;
  }

  get error() {
    if (this.args.error) {
      return 'auk-input--error';
    }
    return null;
  }
}
