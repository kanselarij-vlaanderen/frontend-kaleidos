import Component from '@glimmer/component';

/**
 * Simple wrapper for Ember's <Input> component. Takes all arguments that <Input> takes.
 *
 * @argument {String} icon
 * @argument {String} type: Possible values are ("text", default), "number". Consider other components for "radio", "checkbox", etc..
 * @argument {Boolean} block
 * @argument {String} width: Possible values are "xsmall", "small", "medium", "large" & "xlarge"
 * @argument {Boolean} error
 * @argument {String} value: use "@value=" when you want to access the value directly (2-way binding, get and set)
 * or use "value=" with {{on "input" ...}} when you want to do something with the value (1-way binding, get only)
 * you can use "@value=" with {{on "input" ...}} if you want to update the value anyway, but do something extra (like validation)
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
      return `auk-u-width-${this.args.width}`;
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
