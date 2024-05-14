import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SignaturesEmailModalComponent extends Component {
  @tracked emailBuffer;

  get isValid() {
    return this.emailBuffer?.length <= 254
      && /.+@.+\..+/.test(this.emailBuffer);
  }
}
