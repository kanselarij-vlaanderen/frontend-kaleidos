import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { setAgendaItemsPriority } from 'fe-redpencil/utils/agenda-item-utils';

export default class IndexAgendaitemAgendaitemsAgendaController extends Controller {
  @service currentSession;

  @service store;

  async navigateToNeighbouringItem(agendaItem) {
    // try transitioning to previous or next item
    // TODO: below query can be replaced once agenda-items have relations to previous and next items
    const previousNumber = agendaItem.priority - 1;
    const result = await this.store.query('agendaitem', {
      'filter[agenda][:id:]': this.agenda.id,
      'filter[show-as-remark]': agendaItem.showAsRemark,
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

  async reassignPriorities() {
    const isEditor = this.currentSession.isEditor;
    const isDesignAgenda = this.agenda.isDesignAgenda;
    const agendaItems = await this.agenda.agendaitems;
    setAgendaItemsPriority(agendaItems, isEditor, isDesignAgenda);
  }

  @action
  async reassignPrioritiesAndNavigateToNeighbouringAgendaitem(agendaitem) {
    await this.reassignPriorities();
    await this.navigateToNeighbouringItem(agendaitem);
  }
}
