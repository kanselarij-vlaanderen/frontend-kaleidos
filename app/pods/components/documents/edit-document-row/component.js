import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DocumentList extends Component {
  @service store;

  @tracked documentContainer;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.documentContainer = yield this.args.document.documentContainer;
  }

  @action
  selectDocumentType(documentType) {
    this.documentContainer.set('type', documentType);
  }

  @action
  selectAccessLevel(accessLevel) {
    this.args.document.set('accessLevel', accessLevel);
  }

  @action
  softDelete() {
    this.args.document.set('softDeleted', true);
  }
}
