import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { EMAIL_VALIDATION_REGEX } from 'frontend-kaleidos/config/config';

export default class SignaturesEmailModalComponent extends Component {
  @tracked emailBuffer;

  get isValid() {
    return this.emailBuffer?.length <= 254
      && EMAIL_VALIDATION_REGEX.test(this.emailBuffer);
  }
}
