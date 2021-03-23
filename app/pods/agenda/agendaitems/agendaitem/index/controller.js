import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { reorderAgendaitemsOnAgenda } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class IndexAgendaitemAgendaitemsAgendaController extends Controller {
  @service store;
  @service currentSession;

  @controller('agenda.agendaitems') agendaitemsController;

  get subcase() {
    const agendaActivity = this.model.get('agendaActivity');
    if (agendaActivity) {
      return agendaActivity.get('subcase');
    }
    return null;
  }

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
    this.agendaitemsController.send('reloadModel');
    await this.navigateToNeighbouringItem(this.model);
  }
}
