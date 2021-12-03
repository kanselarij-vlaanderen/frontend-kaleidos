import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import VrNotulenName,
{ compareFunction as compareNotulen } from 'frontend-kaleidos/utils/vr-notulen-name';

export default class DocumentList extends Component {
  /**
   * @argument agendaitem
   */

  @service store;

  @tracked agendaitemDocuments;

  constructor() {
    super(...arguments);
    this.agendaitemDocuments = [];
    this.loadDocuments.perform();
  }

  @task
  *loadDocuments() {
    // This uses the same call as in others routes/components, ensuring we hit the same cache
    let pieces = yield this.store.query('piece', {
      'filter[agendaitems][:id:]': this.args.agendaitem.id,
      'page[size]': PAGE_SIZE.PIECES, // TODO add pagination when sorting is done in the backend
      include: 'document-container',
    });
    pieces = pieces.toArray();
    let sortedPieces;
    if (this.args.agendaitem.isApproval) {
      sortedPieces = sortPieces(pieces, VrNotulenName, compareNotulen);
    } else {
      sortedPieces = sortPieces(pieces);
    }
    this.agendaitemDocuments = sortedPieces;
  }
}

