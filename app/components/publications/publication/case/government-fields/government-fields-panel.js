import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsPublicationCaseGovernmentDomainsPanelComponent extends Component {
  @tracked isOpenLinkModal;

  @action
  saveGovernmentFields(governmentFields) {
    const publicationFlow = this.args.publicationFlow;

    publicationFlow.governmentFields.addObjects(governmentFields);
    this.isOpenLinkModal = false;
  }

  @action
  showLinkModal() {
    this.isOpenLinkModal = true;
  }

  @action
  closeLinkModal() {
    this.isOpenLinkModal = false;
  }
}
