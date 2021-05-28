import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  task,
  lastValue
} from 'ember-concurrency-decorators';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

/**
 * @argument {Agendaitem} agedaitem
 */
export default class PublicationsBatchDocumentsPublicationModalComponent extends Component {
  pieceToPublish;
  @service store;
  @service publicationService;

  @tracked isOpenNewPublicationModal = false;
  @lastValue('loadPieces') pieces;
  @lastValue('loadCase') case;

  constructor() {
    super(...arguments);

    this.loadPieces.perform();
    this.loadCase.perform();
  }

  @task
  *loadPieces() {
    // query: ensure all related records are loaded (to prevent extra calls from template)
    let pieces = yield this.store.query('piece', {
      'filter[agendaitems][:id:]': this.args.agendaitem.id,
      'page[size]': 500, // TODO add pagination when sorting is done in the backend
      include: 'document-container,document-container.type,file,publication-flow,publication-flow.identification',
    });
    // array: <DocumentList /> expects array
    pieces = pieces.toArray();
    pieces = sortPieces(pieces);
    return pieces;
  }

  @task
  // no yield but use of task for @lastValue
  // eslint-disable-next-line require-yield
  *loadCase() {
    return this.store.queryOne('case', {
      'filter[subcases][agenda-activities][agendaitems][:id:]': this.args.agendaitem.id,
    });
  }

  // new publication actions
  @action
  async openNewPublicationModal(piece) {
    this.pieceToPublish = piece;
    this.isOpenNewPublicationModal = true;
  }

  @task
  *saveNewPublication(publicationProperties) {
    const publicationFlow = yield this.publicationService.createNewPublicationFromMinisterialCouncil(publicationProperties, {
      // case should already be loaded here
      case: this.case,
    });
    this.pieceToPublish.publicationFlow = publicationFlow;
    yield this.pieceToPublish.save();
    this.isOpenNewPublicationModal = false;
  }

  @action
  cancelNewPublication() {
    this.isOpenNewPublicationModal = false;
  }
}
