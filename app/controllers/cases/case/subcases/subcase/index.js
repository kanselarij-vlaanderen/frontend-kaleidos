import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class CasesCaseSubcasesSubcaseIndexController extends Controller {
  @service agendaitemAndSubcasePropertiesSync;
  @service currentSession;
  @service store;

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[3];

  @tracked decisionmakingFlow;
  @tracked mandatees;
  @tracked submitter;
  @tracked meeting;
  @tracked agenda;
  @tracked siblingSubcasesCount;

  get showMandateesNotApplicableMessage() {
    return [CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING].includes(this.model.subcase.type?.get('uri'));
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
      this.model.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true,
    );
  }

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = this.model.subcase.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.model.subcase.save();
    const agendaitemsOnDesignAgendaToEdit = await this.store.query('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.model.subcase.id,
      'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
    });
    await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
      setNotYetFormallyOk(agendaitem);
      return agendaitem.save();
    }));
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
    }
  }

  @action
  nextPage() {
    this.page = this.page + 1;
  }

  @action
  setSizeOption(size) {
    this.size = size;
    this.page = 0;
  }
}
