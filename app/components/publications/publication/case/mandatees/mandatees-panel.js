import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';

/**
 * @argument {PublicationFlow} publicationFlow (publication-flow,publication-flow.mandatees,publication-flow.mandatees.person)
 */
export default class PublicationsPublicationCaseMandateesPanelComponent extends Component {
  @tracked showSelectMandateeModal = false;

  @action
  openSelectMandateeModal() {
    this.showSelectMandateeModal = true;
  }

  @action
  closeSelectMandateeModal() {
    this.showSelectMandateeModal = false;
  }

  @action
  async addMandatee(mandatee) {
    addObject(this.args.publicationFlow.mandatees, mandatee);
    await this.args.publicationFlow.save();
    this.showSelectMandateeModal = false;
  }

  @action
  async removeMandatee(mandatee) {
    removeObject(this.args.publicationFlow.mandatees, mandatee);
    await this.args.publicationFlow.save();
  }
}
