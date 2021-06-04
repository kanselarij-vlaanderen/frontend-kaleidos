import Component from '@glimmer/component';

/**
 * Simple wrapper for Ember's <Input> component. Takes all arguments that <Input> takes.
 *
 * @argument {String} icon
 * @argument {String} block
 * @argument {String} error
 */
export default class AuInput extends Component {
  get block() {
    if (this.args.block) {
      return 'auk-input--block';
    }

    return null;
  }

  get error() {
    if (this.args.error === 'true') {
      return 'auk-input--error';
    }

    return null;
  }
}
