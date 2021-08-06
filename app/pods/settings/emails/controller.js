import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import {
  isPresent, isBlank
} from '@ember/utils';
export default class SettingsEmailController extends Controller {
  @service store;

  @tracked emailToTranslationRequest = this.model.translationRequestToEmail;
  @tracked emailToProofRequest = this.model.proofRequestToEmail;
  @tracked emailCcProofRequest = this.model.proofRequestCcEmail;

  @action
  async saveSettings() {
    this.model.translationRequestToEmail = this.emailToTranslationRequest;
    this.model.proofRequestToEmail = this.emailToProofRequest;
    this.model.proofRequestCcEmail = isPresent(this.emailCcProofRequest) ? this.emailCcProofRequest : undefined;
    await this.model.save();
  }

  get isDisabled() {
    return isBlank(this.emailToProofRequest) || isBlank(this.emailToTranslationRequest) ;
  }
}
