import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument agendaitem
 * @argument decisionActivity
 * @argument agendaContext
 */
export default class AgendaAgendaitemDecisionLegacyComponent extends Component {
  @service fileConversionService;
  @service intl;
  @service pieceAccessLevelService;
  @service signatureService;
  @service store;
  @service toaster;
  @service currentSession;

  @tracked report;

  @tracked isEditingPill = false;
  @tracked isAddingReport = false;

  @tracked decisionDocType;

  constructor() {
    super(...arguments);
    this.loadReport.perform();
    this.loadCodelists.perform();
  }

  loadCodelists = task(async () => {
    this.decisionDocType = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.DECISION
    );
  });

  loadReport = task(async () => {
    this.report = await this.args.decisionActivity.belongsTo('report').reload();
  });

  @action
  toggleEditPill() {
    this.isEditingPill = !this.isEditingPill;
  }

  onDecisionEdit = task(async () => {
    await this.updateAgendaitemPiecesAccessLevels.perform();
    await this.updatePiecesSignFlows.perform();
    // In digital we also check if newsItem needs to become hidden based on decisionResult
    // That doesn't make sense here since these views are mainly for viewing
    // For legacy edits we might have to remove some of the automatic updates
  });

  updateAgendaitemPiecesAccessLevels = task(async () => {
    const decisionResultCode = await this.args.decisionActivity
      .decisionResultCode;
    if (
      [
        CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD,
        CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN,
      ].includes(decisionResultCode?.uri)
    ) {
      const pieces = await this.args.agendaitem.pieces;
      for (const piece of pieces.slice()) {
        await this.pieceAccessLevelService.strengthenAccessLevelToInternRegering(
          piece
        );
      }
    }
    this.toggleEditPill();
  });

  updatePiecesSignFlows = task(async () => {
    const decisionResultCode = await this.args.decisionActivity
      .decisionResultCode;
    if (
      decisionResultCode.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN
    ) {
      const pieces = await this.args.agendaitem.pieces;
      for (const piece of pieces.slice()) {
        await this.signatureService.removeSignFlowForPiece(piece);
      }
    }
  });

  @action
  async didDeleteReport() {
    await this.loadReport.perform();
  }

  @action
  async attachNewReportVersionAsPiece(piece) {
    await piece.save();
    try {
      const sourceFile = await piece.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title')
      );
    }
    this.args.decisionActivity.report = piece;
    await this.args.decisionActivity.save();

    // This should happen in document-card but isn't reached.
    await this.pieceAccessLevelService.updatePreviousAccessLevel(piece);

    // This reload is a workaround for file-service "deleteDocumentContainer" having a stale list of pieces
    // when deleting the full container right after adding a new report version without the version history open.
    const documentContainer = await piece.documentContainer;
    await documentContainer.hasMany('pieces').reload();
    await this.loadReport.perform();
  }

  @action
  async attachReportPdf(piece) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
      type: this.decisionDocType,
    });

    const subcase = await this.args.decisionActivity.subcase;
    const subcaseIsConfidential = subcase?.confidential;

    const defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      subcaseIsConfidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID
    );

    await documentContainer.save();
    piece.setProperties({
      accessLevel: defaultAccessLevel,
      documentContainer,
    });
    await piece.save();
    try {
      const sourceFile = await piece.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title')
      );
    }
    this.args.decisionActivity.report = piece;
    const decisionResultCode = await this.args.decisionActivity.decisionResultCode;
    if (!decisionResultCode?.uri) {
      const agendaitemType = await this.args.agendaitem.type;
      const isNota = agendaitemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA
      const decisionresultCodeUri = isNota
        ? CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
        : CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME;
      const decisionResultCode = await this.store.findRecordByUri(
        'concept',
        decisionresultCodeUri
      );
      this.args.decisionActivity.decisionResultCode = decisionResultCode;
    }
    await this.args.decisionActivity.save();
    this.isAddingReport = false;
    await this.loadReport.perform();
  }
}
