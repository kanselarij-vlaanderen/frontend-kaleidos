import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class PublicationsProofsProgressBadgeComponent extends Component {
  @tracked requests;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const subcase = yield this.args.publicationSubcase;
    this.requests = yield subcase.requestActivities;
  }
}
