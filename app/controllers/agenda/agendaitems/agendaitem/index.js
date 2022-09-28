import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { reorderAgendaitemsOnAgenda } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class IndexAgendaitemAgendaitemsAgendaController extends Controller {
  @service store;
  @service currentSession;
  @service router;
  @service agendaitemAndSubcasePropertiesSync;
  @service agendaService;

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
  @tracked decisionActivity;

  @tracked isEditingAgendaItemTitles = false;

  async navigateToNeighbouringItem(agendaitem) {
    // try transitioning to previous or next item, called on the delete of an agendaitem
    // TODO: below query can be replaced once agenda-items have relations to previous and next items
    const previousNumber = agendaitem.number;
    const agendaItemType = await agendaitem.type;
    const neighbouringItem = await this.store.queryOne('agendaitem', {
      'filter[agenda][:id:]': this.agenda.id,
      'filter[type][:id:]': agendaItemType.id,
      'filter[:lte:number]': `"${previousNumber}"`, // Needs quotes because of bug in mu-cl-resources
    });
    if (neighbouringItem) {
      this.router.transitionTo(
        'agenda.agendaitems.agendaitem',
        this.meeting.id,
        this.agenda.id,
        neighbouringItem.id
      );
    } else {
      // If there is no neighbour, we most likely just deleted the last and only agendaitem
      // In this case we should transition to the agenda overview
      this.router.transitionTo(
        'agenda.agendaitems',
        this.meeting.id,
        this.agenda.id,
        { queryParams: { anchor: null } }
      );
    }
  }

  async reassignNumbersForAgendaitems() {
    await reorderAgendaitemsOnAgenda(this.agenda, this.currentSession.may('manage-agendaitems'));
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
    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.model,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true,
    );
    this.agendaitemsController.groupNotasOnGroupName.perform();
  }

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = await this.subcase.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.subcase.save();
  }
}
