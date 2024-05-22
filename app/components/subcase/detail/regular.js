import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class SubcaseDetailRegular extends Component {
  @service store;
  @service currentSession;

  @tracked hideAccessLevel = false;

  constructor() {
    super(...arguments);
    this.loadAccessLevelPillVisibility.perform();
  }

  @task
  *loadAccessLevelPillVisibility() {
    const latestDecisionActivity = yield this.store.queryOne('decision-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      sort: '-start-date',
    });
    if (latestDecisionActivity && 
      ((latestDecisionActivity.isRetracted || latestDecisionActivity.isPostponed) &&
      !this.currentSession.may('view-access-level-pill-when-postponed'))) {
      this.hideAccessLevel = true;
    }
  }
}
