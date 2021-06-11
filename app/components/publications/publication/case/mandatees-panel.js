import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PublicationsPublicationCaseMandateesPanelComponent extends Component {
  @service store;
  @tracked isOpenLinkModal = false;
  @tracked mandatees;

  @action
  openLinkModal() {
    this.isOpenLinkModal = true;
  }

  @action
  closeLinkModal() {
    this.isOpenLinkModal = false;
  }

  @action
  async onLink() {
    this.isOpenLinkModal = false;
  }

  @action
  async unlink(mandatee) {
    this.args.publicationFlow.mandatees.removeObject(mandatee);
    await this.args.publicationFlow.save();
  }
}
