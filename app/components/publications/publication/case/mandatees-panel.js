import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @argument {PublicationFlow} publicationFlow (publication-flow,publication-flow.mandatees,publication-flow.mandatees.person)
 */
export default class PublicationsPublicationCaseMandateesPanelComponent extends Component {
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
  async link(selection) {
    this.args.publicationFlow.mandatees.addObject(selection);
    await this.args.publicationFlow.save();
    this.isOpenLinkModal = false;
  }

  @action
  async unlink(mandatee) {
    this.args.publicationFlow.mandatees.removeObject(mandatee);
    await this.args.publicationFlow.save();
  }
}
