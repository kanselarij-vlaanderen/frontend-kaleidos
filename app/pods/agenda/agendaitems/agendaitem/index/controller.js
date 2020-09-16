import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { setAgendaitemsPriority } from 'fe-redpencil/utils/agendaitem-utils';

export default class IndexAgendaitemAgendaitemsAgendaController extends Controller {
  @service currentSession;

  @service store;

  @action
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
    const isDesignAgenda = this.agenda.isDesignAgenda;
    const agendaitems = await this.agenda.agendaitems;
    const announcements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark);
    const actualAgendaitems = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark && !agendaitem.isDeleted)
      .sortBy('priority');
    if (announcements) {
      const actualAnnouncements = announcements.filter((announcement) => !announcement.isDeleted).sortBy('priority');
      await setAgendaitemsPriority(actualAnnouncements, isEditor, isDesignAgenda);
    }
    await setAgendaitemsPriority(actualAgendaitems, isEditor, isDesignAgenda);
  }

  @action
  async reassignPrioritiesAndNavigateToNeighbouringAgendaitem(agendaitem) {
    await this.reassignPrioritiesForAgendaitems();
    await this.navigateToNeighbouringItem(agendaitem);
  }
}
