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
  @tracked meeting;
  @tracked agenda;
  @tracked agendaActivity;
  @tracked reverseSortedAgendas;
  @tracked subcase;
  @tracked submitter;
  @tracked newsletterInfo;
  @tracked mandatees;

  @tracked isEditingAgendaItemTitles = false;

  async navigateToNeighbouringItem(agendaitem) {
    // try transitioning to previous or next item
    // TODO: below query can be replaced once agenda-items have relations to previous and next items
    const previousNumber = agendaitem.number;
    const neighbouringItem = await this.store.queryOne('agendaitem', {
      'filter[agenda][:id:]': this.agenda.id,
      'filter[show-as-remark]': agendaitem.showAsRemark,
      'filter[:lte:number]': `"${previousNumber}"`, // Needs quotes because of bug in mu-cl-resources
      sort: '-number',
    });
    if (neighbouringItem) {
      this.router.transitionTo('agenda.agendaitems.agendaitem', this.meeting.id, this.agenda.id, neighbouringItem.id);
    } else {
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
    this.agendaitemsController.send('reloadModel');
    // The call to reloadModel causes a refresh of the agenda.agendaitems route, so its model gets recalculated
    // Because we're a subroute of that route, our model will also get recalculated, using the current route
    // That means that we're going to query for the current agendaitem, which has been deleted, because
    // this method only gets called when the agendaitem gets deleted.
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
