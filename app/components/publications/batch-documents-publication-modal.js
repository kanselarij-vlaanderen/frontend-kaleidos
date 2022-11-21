import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { task } from 'ember-concurrency';

/**
 * @argument {Agendaitem} agedaitem
 * @argument {Piece[]} pieces
 */
export default class PublicationsBatchDocumentsPublicationModalComponent extends Component {
  @service store;
  @service publicationService;
  @service toaster;
  @service intl;

  @tracked isOpenNewPublicationModal = false;

  @tracked referenceDocument;
  @tracked case;
  @tracked decisionActivity;
  @tracked mandatees;

  constructor() {
    super(...arguments);
    this.loadPieces.perform();
    this.loadCase.perform();
    this.loadDecisionActivity.perform();
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
      'filter[decisionmaking-flow][subcases][agenda-activities][agendaitems][:id:]':
        this.args.agendaitem.id,
    });
  }

  @task
  *loadMandatees() {
    this.mandatees = yield this.args.agendaitem.mandatees;
  }

  @task
  *loadDecisionActivity() {
    this.decisionActivity = yield this.store.queryOne(
      'decision-activity',
      {
        'filter[treatment][agendaitems][:id:]': this.args.agendaitem.id,
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
          decisionActivity: this.decisionActivity,
          mandatees: this.mandatees,
          regulationType: regulationType,
        }
      );
    this.referenceDocument.publicationFlow = publicationFlow;
    await this.referenceDocument.save();
  }

  @action
  async linkPublicationFlow(piece, publicationFlow) {
    let publicationFlowHasChanged = false;

    const _case = await publicationFlow.case;
    if (this.case.id != _case.id) {
      const decisionActivity = await publicationFlow.decisionActivity;
      const agendaitem = await this.store.queryOne('agendaitem', {
        'filter[treatment][decision-activity][:id:]': decisionActivity.id
      });
      if (!agendaitem) {
        // Selected publication-flow is currently linked to another case (not via MR).
        // We need to relink the publication-flow to this case and cleanup the dummy data
        // that was created for the publication-flow back then.
        publicationFlow.case = this.case;
        publicationFlow.decisionActivity = this.decisionActivity;
        publicationFlowHasChanged = true;
        await Promise.all([
          _case.destroyRecord(),
          decisionActivity.destroyRecord(),
        ]);
      } else {
        // Publication-flow is already linked to an decision-activity that has been
        // handled on an agenda. We cannot relink the publication-flow in that case.
        // In practice this scenario will only occur in concurrency scenarios where
        // multiple users try to link the same publication at the same time to
        // different cases.
        this.toaster.error(
          this.intl.t('unable-to-relink-publication-flow'),
          this.intl.t('warning-title')
        );
        return;
      }
    }

    const regulationType = await publicationFlow.regulationType;
    if (!regulationType) {
      const regulationTypeFromDocument =
        await this.getRegulationTypeThroughReferenceDocument(piece);
      if (regulationTypeFromDocument) {
        publicationFlow.regulationType = regulationTypeFromDocument;
        publicationFlowHasChanged = true;
      }
    }

    if (publicationFlowHasChanged) {
      await publicationFlow.save();
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
