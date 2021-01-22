import Component from '@glimmer/component';

export default class FormHelp extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-form-help-text--${this.args.skin}`;
    }
    return null;
  }
}
