import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class PublicationNavigation extends Component {
  @service store;
  @service publicationService;

  @tracked isViaCouncilOfMinisters;
  @tracked numberOfDocuments = undefined;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const { publicationFlow } = this.args;

    const pieces = yield this.store.query('piece', {
      'filter[publication-flow][:id:]': publicationFlow.id,
      'page[size]': 1,
    });
    this.numberOfDocuments = pieces.meta.count;

    this.isViaCouncilOfMinisters = this.publicationService.getIsViaCouncilOfMinisters(publicationFlow);
  }
}
