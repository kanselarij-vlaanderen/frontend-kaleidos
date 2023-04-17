import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaSideNavComponent extends Component {
  /**
   * @argument meeting
   * @argument currentAgenda
   * @argument reverseSortedAgendas
   */
  @tracked isCollapsedSidebar = false;

  getLatestAgendaStatusActivity = async (agenda) => {
    const activities = await agenda.agendaStatusActivities.toArray();
    const sorted = activities.sort((a, b) => b.startDate - a.startDate);
    if (sorted.length) {
      return sorted[0];
    }
  }

  @action
  toggleSidebar() {
    this.isCollapsedSidebar = !this.isCollapsedSidebar;
  }
}
