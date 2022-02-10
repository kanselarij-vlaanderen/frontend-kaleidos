import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * @argument {translationSubcase}
 * @argument {requestActivity}
 */
export default class PublicationsPublicationTranslationTranslationRequestedPanel extends Component {
  @service store;

  @tracked isVerifyingDelete = false;


  constructor() {
    super(...arguments);
  }

  @action
  promptDeleteRequest() {
    this.isVerifyingDelete = true;
  }

  @action
  cancelDeleteRequest() {
    this.isVerifyingDelete = false;
  }

  @action
  async deleteRequest() {
    await this.args.onDeleteRequest();
    this.isVerifyingDelete = false;
  }
}
