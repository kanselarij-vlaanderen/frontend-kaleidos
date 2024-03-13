import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubcaseDetailPanelsMandateesComponent extends Component {
  get showMandateesNotApplicableMessage() {
    return [CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING].includes(
      this.args.subcase.type?.get('uri')
    );
  }

  @action
  async saveMandateeData(mandateeData) {
    const propertiesToSetOnAgendaitem = {
      mandatees: mandateeData.mandatees,
    };
    const propertiesToSetOnSubcase = {
      mandatees: mandateeData.mandatees,
      requestedBy: mandateeData.submitter,
    };
    this.mandatees = mandateeData.mandatees;
    this.submitter = mandateeData.submitter;
    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true
    );
  }
}
