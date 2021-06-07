import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  task,
  lastValue
} from 'ember-concurrency-decorators';

/**
 * @argument {Agendaitem} agedaitem
 * @argument {Piece[]} pieces
 */
export default class PublicationsBatchDocumentsPublicationModalComponent extends Component {
  @service store;
  @service publicationService;

  @tracked referenceDocument;
  @tracked isOpenNewPublicationModal = false;
  @lastValue('loadCase') case;

  constructor() {
    super(...arguments);
    this.loadPieces.perform();
    this.loadCase.perform();
  }

  @task
  *loadPieces() {
    // ensure all related records are loaded to prevent extra calls from template for each piece individually
    yield this.store.query('piece', {
      'filter[agendaitems][:id:]': this.args.agendaitem.id,
      'page[size]': this.args.pieces.length,
      include: 'document-container,document-container.type,file,publication-flow,publication-flow.identification',
    });
  }

  @task
  // no yield but use of task for @lastValue
  // eslint-disable-next-line require-yield
  *loadCase() {
    return this.store.queryOne('case', {
      'filter[subcases][agenda-activities][agendaitems][:id:]': this.args.agendaitem.id,
    });
  }

  @action
  openNewPublicationModal(piece) {
    this.referenceDocument = piece;
    this.isOpenNewPublicationModal = true;
  }

  @task
  *saveNewPublication(publicationProperties) {
    const publicationFlow = yield this.publicationService.createNewPublicationFromMinisterialCouncil(publicationProperties, {
      case: this.case,
    });
    this.referenceDocument.publicationFlow = publicationFlow;
    yield this.referenceDocument.save();
    this.isOpenNewPublicationModal = false;
    this.referenceDocument = null;
  }

  @action
  cancelNewPublication() {
    this.isOpenNewPublicationModal = false;
    this.referenceDocument = null;
  }

  @action
  async linkPublicationFlow(piece, publicationFlow) {
    piece.publicationFlow = publicationFlow;
    await piece.save();
  }

  @action
  async unlinkPublicationFlow(piece) {
    piece.publicationFlow = null;
    await piece.save();
  }
}
