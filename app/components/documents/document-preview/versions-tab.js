import Component from '@glimmer/component';
import { service } from '@ember/service';
import { sortPieceVersions } from 'frontend-kaleidos/utils/documents';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentPreviewVersionsTabComponent extends Component {
  @service store;

  @tracked versions;

  constructor() {
    super(...arguments);
    this.loadVersionsData.perform();
  }

  loadVersionsData = task(async () => {
    if (this.args.documentContainer?.id) {

      const pieces = await this.store.queryAll('piece', {
        'filter[document-container][:id:]': this.args.documentContainer.id,
        include: 'previous-piece,next-piece',
      });
      this.versions = pieces.slice();
    } else {
      this.versions = [];
    }
  });

  get sortedVersions() {
    return sortPieceVersions(this.versions);
  }
}
