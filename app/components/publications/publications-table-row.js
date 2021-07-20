import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsPublicationsTableRowComponent extends Component {
  @service router;
  @service store;

  @tracked decision;

  constructor() {
    super(...arguments);

    this.loadDecision.perform();
  }

  @task
  *loadDecision() {
    const publicationSubcase = yield this.args.publicationFlow.publicationSubcase;
    this.decision = yield this.store.queryOne('decision', {
      'filter[publication-activity][subcase][:id:]': publicationSubcase.id,
      sort: 'publication-activity.start-date,publication-date',
    });
  }

  @action
  navigateToPublication() {
    this.router.transitionTo('publications.publication', this.args.publicationFlow.id);
  }
}
