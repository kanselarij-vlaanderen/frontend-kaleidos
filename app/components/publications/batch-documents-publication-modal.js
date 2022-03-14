import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument {Agendaitem} agedaitem
 * @argument {Piece[]} pieces
 */
export default class PublicationsBatchDocumentsPublicationModalComponent extends Component {
  @service store;
  @service publicationService;

  @tracked isOpenNewPublicationModal = false;

  @tracked referenceDocument;
  @tracked case;
  @tracked agendaItemTreatment;
  @tracked mandatees;

  constructor() {
    super(...arguments);
    this.loadPieces.perform();
    this.loadCase.perform();
    this.loadAgendaItemTreatment.perform();
    this.loadMandatees.perform();
  }

  @task
  *loadPieces() {
    // ensure all related records are loaded to prevent extra calls from template for each piece individually
    yield this.store.query('piece', {
      'filter[agendaitems][:id:]': this.args.agendaitem.id,
      'page[size]': this.args.pieces.length,
      include:
        'document-container,document-container.type,file,publication-flow,publication-flow.identification',
    });
  }

  @task
  *loadCase() {
    this.case = yield this.store.queryOne('case', {
      'filter[subcases][agenda-activities][agendaitems][:id:]':
        this.args.agendaitem.id,
    });
  }

  @task
  *loadMandatees() {
    this.mandatees = yield this.args.agendaitem.mandatees;
  }

  @task
  *loadAgendaItemTreatment() {
    this.agendaItemTreatment = yield this.store.queryOne(
      'agenda-item-treatment',
      {
        'filter[agendaitem][:id:]': this.args.agendaitem.id,
        sort: '-start-date',
      }
    );
  }

  @action
  openNewPublicationModal(piece) {
    this.referenceDocument = piece;
    this.isOpenNewPublicationModal = true;
  }

  @action
  cancelNewPublication() {
    this.referenceDocument = null;
    this.isOpenNewPublicationModal = false;
  }

  @task
  *saveNewPublication(publicationProperties) {
    yield this.performSaveNewPublication(publicationProperties);

    this.referenceDocument = null;
    this.isOpenNewPublicationModal = false;
  }

  // separate method: prevent incomplete save
  async performSaveNewPublication(publicationProperties) {
    const regulationType = await this.getRegulationTypeThroughReferenceDocument(
      this.referenceDocument
    );
    const publicationFlow =
      await this.publicationService.createNewPublicationFromMinisterialCouncil(
        publicationProperties,
        {
          case: this.case,
          agendaItemTreatment: this.agendaItemTreatment,
          mandatees: this.mandatees,
          regulationType: regulationType,
        }
      );
    this.referenceDocument.publicationFlow = publicationFlow;
    await this.referenceDocument.save();
  }

  @action
  async linkPublicationFlow(piece, publicationFlow) {
    const regulationType = await publicationFlow.regulationType;
    if (!regulationType) {
      const regulationTypeFromDocument =
        await this.getRegulationTypeThroughReferenceDocument(piece);
      if (regulationTypeFromDocument) {
        publicationFlow.regulationType = regulationTypeFromDocument;
        await publicationFlow.save();
      }
    }
    piece.publicationFlow = publicationFlow;
    await piece.save();
  }

  @action
  async unlinkPublicationFlow(piece) {
    piece.publicationFlow = null;
    await piece.save();
  }

  async getRegulationTypeThroughReferenceDocument(referenceDocument) {
    const documentContainer = await referenceDocument.documentContainer;
    const documentType = await documentContainer.type;
    let regulationType;
    switch (documentType?.uri) {
      case CONSTANTS.DOCUMENT_TYPES.DECREET:
        regulationType = await this.store.findRecordByUri(
          'regulation-type',
          CONSTANTS.REGULATION_TYPES.DECREET
        );
        break;
      case CONSTANTS.DOCUMENT_TYPES.BVR:
        regulationType = await this.store.findRecordByUri(
          'regulation-type',
          CONSTANTS.REGULATION_TYPES.BVR
        );
        break;
      case CONSTANTS.DOCUMENT_TYPES.MB:
        regulationType = await this.store.findRecordByUri(
          'regulation-type',
          CONSTANTS.REGULATION_TYPES.MB
        );
        break;
      default:
        regulationType = undefined;
        break;
    }
    return regulationType;
  }
}
