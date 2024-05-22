import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class SubcaseDetailRegular extends Component {
  @service store;
  @service currentSession;

  @tracked hideAccessLevel = false;
  @tracked latestDecisionActivity;
  constructor() {
    super(...arguments);
    this.loadLatestDecisionActivity.perform();
  }

  @task
  *loadLatestDecisionActivity() {
    this.latestDecisionActivity = yield this.store.queryOne('decision-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      sort: '-start-date',
    });
    if (this.latestDecisionActivity &&
      ((this.latestDecisionActivity.isRetracted || this.latestDecisionActivity.isPostponed) &&
      !this.currentSession.may('view-access-level-pill-when-postponed'))) {
      this.hideAccessLevel = true;
    }
  }
}
