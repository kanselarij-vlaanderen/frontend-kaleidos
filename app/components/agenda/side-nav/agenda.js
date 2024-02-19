import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class AgendaSideNavAgendaComponent extends Component {
  /**
   * @argument currentAgenda
   * @argument meeting
   * @argument agenda
   * @argument isOpen
   */

  @service store;

  getLatestAgendaStatusActivity = async (agenda) => {
    return await this.store.queryOne('agenda-status-activity', {
      'filter[agenda][:id:]': agenda.id,
      sort: '-start-date',
    });
  }
}
