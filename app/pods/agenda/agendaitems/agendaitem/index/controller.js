import Controller, { inject as controller } from '@ember/controller';
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
  @service router;

  @controller('agenda.agendaitems') agendaitemsController;
  @controller('agenda') agendaController;
  @tracked meeting;
  @tracked agenda;
  @tracked agendaActivity;
  @tracked reverseSortedAgendas;
  @tracked subcase;
  @tracked submitter;
  @tracked newsletterInfo;
  @tracked mandatees;

  @tracked isEditingAgendaItemTitles = false;

  get latestAgenda() {
    return this.reverseSortedAgendas.firstObject;
  }

  get currentAgendaIsLatest() {
    return (
      this.latestAgenda.id === this.agenda.id
    );
  }

  async navigateToNeighbouringItem(agendaitem) {
    // try transitioning to previous or next item, called on the delete of an agendaitem
    // TODO: below query can be replaced once agenda-items have relations to previous and next items
    const previousNumber = agendaitem.number;
    const neighbouringItem = await this.store.queryOne('agendaitem', {
      'filter[agenda][:id:]': this.agenda.id,
      'filter[show-as-remark]': agendaitem.showAsRemark,
      'filter[:lte:number]': `"${previousNumber}"`, // Needs quotes because of bug in mu-cl-resources
    });
    if (neighbouringItem) {
      this.router.transitionTo('agenda.agendaitems.agendaitem', this.meeting.id, this.agenda.id, neighbouringItem.id);
    } else {
      // If there is no neighbour, we most likely just deleted the last and only agendaitem
      // In this case we should transition to the agenda overview
      this.router.transitionTo('agenda.agendaitems', this.meeting.id, this.agenda.id,{ queryParams: { anchor: null }});
    }
  }

  async reassignNumbersForAgendaitems() {
    const isEditor = this.currentSession.isEditor;
    await reorderAgendaitemsOnAgenda(this.agenda, isEditor);
  }

  @action
  async reassignNumbersAndNavigateToNeighbouringAgendaitem() {
    await this.reassignNumbersForAgendaitems();
    await this.navigateToNeighbouringItem(this.model);
    // reload the agenda route, detail tab should no longer show if we deleted the last and only agendaitem
    // Also, if we deleted the first agendaitem, we should also reload the main route to reload <Agenda::agendaTabs>
    return this.agendaController.send('reloadAgendaModel');
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
    const propertiesToSetOnSubcase = {
      mandatees: mandateeData.mandatees,
      requestedBy: mandateeData.submitter,
    };
    this.mandatees = mandateeData.mandatees;
    this.submitter = mandateeData.submitter;
    await saveChanges(this.model, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, true);
    this.agendaitemsController.groupNotasOnGroupName.perform();
  }

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const case_ = await this.subcase.case;
    const governmentAreas = await case_.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await case_.save();
  }
}
