import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class SubcaseVersionsPanel extends Component {
  /**
   * @argument subcase
   */
  @service store;
  @service intl;

  @tracked hasAgendaitems = false;

  constructor() {
    super(...arguments);
    this.loadAgendaData.perform();
  }

  @task
  *loadAgendaData() {
    const agendaActivities = yield this.args.subcase.hasMany('agendaActivities').reload();
    this.hasAgendaitems = agendaActivities?.length > 0;
  }
}