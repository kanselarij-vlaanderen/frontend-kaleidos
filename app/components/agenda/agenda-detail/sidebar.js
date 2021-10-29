import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class AgendaSidebar extends Component {
  /**
   * @argument notaGroups: Array of AgendaitemGroup-objects
   * @argument isLoadingNotaGroups: boolean indicating whether to show the loading state for nota's
   * @argument announcements
   * @argument newItems: items to be marked as "new on this agenda"
   */
  @tracked isDesignAgenda;

  constructor() {
    super(...arguments);
    this.determineIfDesignAgenda.perform();
  }

  @task
  *determineIfDesignAgenda() {
    const agendaStatus = yield this.args.currentAgenda.status;
    this.isDesignAgenda = agendaStatus.isDesignAgenda;
  }
}
