import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Inputmask from 'inputmask';

export default class SignaturesEmailModalComponent extends Component {
  inputmask;
  @tracked emailBuffer;

  constructor() {
    super(...arguments);

    this.inputmask = new Inputmask(this.inputmaskOptions);
  }

  get inputmaskOptions() {
    return {
      alias: 'email',
    };
  }

  @action
  onInputEvent(event) {
    this.emailBuffer = event.target.value;
  }

  get isValid() {
    return this.inputmask.isValid(this.emailBuffer);
  }
}
