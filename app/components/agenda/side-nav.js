import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class AgendaSideNavComponent extends Component {
  @service store;

  @tracked isCollapsedSidebar = false;
  @tracked agendas = [];

  constructor() {
    super(...arguments);
    this.loadAgendas.perform();
  }

  @keepLatestTask
  *loadAgendas() {
    this.agendas = yield this.store.query('agenda', {
      'filter[created-for][:id:]': this.args.meeting.id,
      sort: '-serialnumber',
      include: 'status',
    });
  }

  @action
  toggleSidebar() {
    this.isCollapsedSidebar = !this.isCollapsedSidebar;
  }
}
