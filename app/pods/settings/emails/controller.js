import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
export default class SettingsEmailController extends Controller {
  @service store;

  @tracked emailToProofRequest = this.model.proofRequestToEmail;
  @tracked emailToTranslationRequest = this.model.translationRequestToEmail;

  @action
  async saveSettings() {
    this.model.proofRequestToEmail = this.emailToProofRequest;
    this.model.translationRequestToEmail = this.emailToTranslationRequest;
    await this.model.save();
  }

  get isDisabled() {
    return isBlank(this.emailToProofRequest) || isBlank(this.emailToTranslationRequest) ;
  }
}
