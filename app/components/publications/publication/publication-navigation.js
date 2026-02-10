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

  loadData = task(async () => {
    const { publicationFlow } = this.args;

    this.numberOfDocuments = await this.store.count('piece', {
      'filter[publication-flow][:id:]': publicationFlow.id,
    });

    this.isViaCouncilOfMinisters = this.publicationService.getIsViaCouncilOfMinisters(publicationFlow);
  });
}
