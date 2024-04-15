import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { trackedFunction } from 'reactiveweb/function';
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

  mandatees = trackedFunction(this, async () => {
    const mandateesPromise = this.args.publicationFlow.mandatees;
    const mandatees = await mandateesPromise;
    return mandatees.slice();
  });

  @action
  async addMandatee(mandatee) {
    const mandatees = await this.args.publicationFlow.mandatees;
    addObject(mandatees, mandatee);
    this.args.publicationFlow.mandatees = mandatees;
    await this.args.publicationFlow.save();
    this.showSelectMandateeModal = false;
  }

  @action
  async removeMandatee(mandatee) {
    const mandatees = await this.args.publicationFlow.mandatees;
    removeObject(mandatees, mandatee);
    this.args.publicationFlow.mandatees = mandatees;
    await this.args.publicationFlow.save();
  }
}
