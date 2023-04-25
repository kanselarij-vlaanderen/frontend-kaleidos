import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class AgendaSideNavComponent extends Component {
  /**
   * @argument meeting
   * @argument currentAgenda
   * @argument reverseSortedAgendas
   */

  @service store;
  @tracked isCollapsedSidebar = false;

  getLatestAgendaStatusActivity = async (agenda) => {
    return await this.store.queryOne('agenda-status-activity', {
      'filter[agenda][:id:]': agenda.id,
      sort: '-start-date',
    });
  }

  @action
  toggleSidebar() {
    this.isCollapsedSidebar = !this.isCollapsedSidebar;
  }
}
