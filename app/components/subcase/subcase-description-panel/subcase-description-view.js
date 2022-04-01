import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class SubcaseDescriptionView extends Component {
  /**
   * @argument subcase
   * @argument onClickEdit
   */
  @service store;
  @service currentSession;

  @tracked latestMeeting = null;
  @tracked latestAgenda = null;
  @tracked latestAgendaitem = null;

  constructor() {
    super(...arguments);
    this.loadAgendaData.perform();
  }

  @task
  *loadAgendaData() {
    this.latestMeeting = yield this.args.subcase.requestedForMeeting;
    if (this.latestMeeting) {
      this.latestAgenda = yield this.store.queryOne('agenda', {
        'filter[created-for][:id:]': this.latestMeeting.id,
        sort: '-serialnumber',
      });
      this.latestAgendaitem = yield this.store.queryOne('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });
    }
  }
}
