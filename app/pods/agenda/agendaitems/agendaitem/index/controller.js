import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import {
  saveChanges,
  reorderAgendaitemsOnAgenda
} from 'frontend-kaleidos/utils/agendaitem-utils';

export default class IndexAgendaitemAgendaitemsAgendaController extends Controller {
  @service store;
  @service currentSession;

  @tracked agenda;
  @tracked subcase;
  @tracked governmentFields;
  @tracked newsletterInfo;

  @tracked isEditingAgendaItemTitles = false;

  async navigateToNeighbouringItem(agendaitem) {
    // try transitioning to previous or next item
    // TODO: below query can be replaced once agenda-items have relations to previous and next items
    const previousNumber = agendaitem.priority - 1;
    const result = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': this.agenda.id,
      'filter[show-as-remark]': agendaitem.showAsRemark,
      'filter[:gte:priority]': `"${previousNumber}"`, // Needs quotes because of bug in mu-cl-resources
      'page[size]': 1,
    });
    if (result.length) {
      const neighbouringItem = result.firstObject;
      this.transitionToRoute('agenda.agendaitems.agendaitem', neighbouringItem.id);
    } else {
      this.transitionToRoute('agenda.agendaitems');
    }
  }

  async reassignPrioritiesForAgendaitems() {
    const isEditor = this.currentSession.isEditor;
    await reorderAgendaitemsOnAgenda(this.agenda, isEditor);
  }

  @action
  async reassignPrioritiesAndNavigateToNeighbouringAgendaitem() {
    await this.reassignPrioritiesForAgendaitems();
    await this.navigateToNeighbouringItem(this.model);
  }

  @action
  async toggleIsEditingAgendaItemTitles() {
    this.isEditingAgendaItemTitles = !this.isEditingAgendaItemTitles;
  }

  @action
  async saveMandateeData(mandateeData) {
    const propertiesToSetOnAgendaitem = {
      mandatees: mandateeData.mandatees,
    };
    const correspondingIseCodes = await this.store.query('ise-code', {
      'filter[field][:id:]': mandateeData.fields.map((field) => field.id).join(','),
    });
    const propertiesToSetOnSubcase = {
      mandatees: mandateeData.mandatees,
      requestedBy: mandateeData.submitter,
      iseCodes: correspondingIseCodes,
    };
    this.governmentFields = mandateeData.fields;
    await saveChanges(this.model, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, true);
  }
}
