import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';

import { isPresent, isBlank } from '@ember/utils';
export default class SettingsEmailController extends Controller {
  @service store;

  @tracked emailToTranslationRequest = this.model.translationRequestToEmail;
  @tracked emailToProofRequest = this.model.proofRequestToEmail;
  @tracked emailCcProofRequest = this.model.proofRequestCcEmail;

  @task
  *saveSettings() {
    this.model.translationRequestToEmail = this.emailToTranslationRequest;
    this.model.proofRequestToEmail = this.emailToProofRequest;
    this.model.proofRequestCcEmail = isPresent(this.emailCcProofRequest)
      ? this.emailCcProofRequest
      : undefined;
    yield this.model.save();

    this.transitionToRoute('settings.overview');
  }

  get isDisabled() {
    return (
      isBlank(this.emailToProofRequest) ||
      isBlank(this.emailToTranslationRequest)
    );
  }
}
