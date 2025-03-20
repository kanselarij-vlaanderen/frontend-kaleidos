import Component from '@glimmer/component';
import { sortPieceVersions } from 'frontend-kaleidos/utils/documents';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentPreviewVersionsTabComponent extends Component {
  @tracked versions;

  constructor() {
    super(...arguments);
    this.loadVersionsData.perform();
  }

  @task
  *loadVersionsData() {
    if (this.args.documentContainer?.id) {
      const pieces = yield this.args.documentContainer.hasMany('pieces').reload();
      this.versions = pieces.slice();
    } else {
      this.versions = [];
    }
  }

  get sortedVersions() {
    return sortPieceVersions(this.versions);
  }
}
