import Component from '@glimmer/component';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class DocumentsDocumentPreviewVersionsTabComponent extends Component {
  @tracked versions;

  constructor() {
    super(...arguments);
    this.loadVersionsData.perform();
  }

  @task
  *loadVersionsData() {
    const pieces = yield this.args.documentContainer.hasMany('pieces').reload();
    this.versions = pieces.toArray();
  }

  get sortedVersions() {
    return sortPieces(this.versions);
  }
}
