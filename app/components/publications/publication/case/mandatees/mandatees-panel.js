import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @argument {PublicationFlow} publicationFlow (publication-flow,publication-flow.mandatees,publication-flow.mandatees.person)
 * @argument {ReferenceDate} Date of to get active Mandatees for
 */
export default class PublicationsPublicationCaseMandateesPanelComponent extends Component {
  @tracked showSelectMandateeModal = false;

  get publicationReferenceDate() {
    if (this.args.isViaCouncilOfMinisters) {
      return this.args.publicationFlow.agendaItemTreatment.startDate;
    }
    return this.args.publicationFlow.openingDate;
  }

  @action
  openSelectMandateeModal() {
    this.showSelectMandateeModal = true;
  }

  @action
  closeSelectMandateeModal() {
    this.showSelectMandateeModal = false;
  }

  @action
  async addMandatee(selection) {
    this.args.publicationFlow.mandatees.addObject(selection);
    await this.args.publicationFlow.save();
    this.showSelectMandateeModal = false;
  }

  @action
  async removeMandatee(mandatee) {
    this.args.publicationFlow.mandatees.removeObject(mandatee);
    await this.args.publicationFlow.save();
  }
}
