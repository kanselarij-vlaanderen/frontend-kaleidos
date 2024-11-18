import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SignaturesEmailModalComponent extends Component {
  @tracked emailBuffer;

  get isValid() {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return this.emailBuffer?.length <= 254
      && regex.test(this.emailBuffer);
  }
}
