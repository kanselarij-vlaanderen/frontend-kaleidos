import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class AgendaSideNavComponent extends Component {
  /**
   * @argument meeting
   * @argument currentAgenda
   * @argument reverseSortedAgendas
   */
  @service store;

  @tracked isCollapsedSidebar = false;
  @tracked agendaHasStatusActivities = false;
  @tracked mostRecentStatusActivity = undefined;
  @tracked mostRecentStatusActivityIsApproved = false

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const agendaStatusActivities = this.args.currentAgenda.get('agendaStatusActivities');
    if (agendaStatusActivities.length > 0) {
      this.agendaHasStatusActivities = true;
      const sortedAgendaStatusActivities = yield agendaStatusActivities.sort((a,b) => a.startDate - b.startDate);
      this.mostRecentStatusActivity = sortedAgendaStatusActivities[sortedAgendaStatusActivities.length -1];
      if (this.mostRecentStatusActivity.statusSet.isApproved) {
        this.mostRecentStatusActivityIsApproved = true;
      }
    }
  }

  @action
  toggleSidebar() {
    this.isCollapsedSidebar = !this.isCollapsedSidebar;
  }
}
