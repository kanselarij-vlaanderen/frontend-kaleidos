import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SignaturesEmailModalComponent extends Component {
  @tracked emailBuffer;

  @action
  onInputEvent(event) {
    this.emailBuffer = event.target.value;
  }

  get isValid() {
    return this.emailBuffer?.length <= 254
      && /.+@.+\..+/.test(this.emailBuffer);
  }
}
