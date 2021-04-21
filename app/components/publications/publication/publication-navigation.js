import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationNavigation extends Component {
  @tracked documentsCount

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const pieces = yield this.args.publicationFlow.case.get('pieces');
    this.documentsCount = pieces.length;
  }
}
