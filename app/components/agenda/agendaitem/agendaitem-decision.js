import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument agendaitem
 * @argument decisionActivity
 */
export default class AgendaitemDecisionComponent extends Component {
  @service currentSession;
  @service store;
  @service pieceAccessLevelService;
  @service toaster;
  @service fileConversionService;

  @tracked report;
  @tracked previousReport;

  @tracked isEditing = false;
  @tracked isAddingReport = false;

  @tracked decisionDocType;

  constructor() {
    super(...arguments);
    this.loadReport.perform();
    this.loadCodelists.perform();
  }

  @task
  *loadCodelists() {
    this.decisionDocType = yield this.store.findRecordByUri('concept', CONSTANTS.DOCUMENT_TYPES.DECISION);
  }

  @action
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  @action
  toggleIsAddingReport() {
    this.isAddingReport = !this.isAddingReport;
  }

  @task
  *loadReport() {
    this.report = yield this.args.decisionActivity.report;
    this.previousReport = yield this.report?.previousPiece;
  }

  @task
  *updateAgendaitemPiecesAccessLevels() {
    const decisionResultCode = yield this.args.decisionActivity.decisionResultCode;
    if ([CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD, CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN].includes(decisionResultCode.uri)) {
      const pieces = this.args.agendaitem.pieces;
      for (const piece of pieces.toArray()) {
        yield this.pieceAccessLevelService.strengthenAccessLevelToInternRegering(piece);
      }
    }
    this.toggleEdit();
  }

  @action
  async attachReport(piece) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
      type: this.decisionDocType,
    });

    const subcase = await this.args.decisionActivity.subcase;
    const subcaseIsConfidential = subcase?.confidential;

    const defaultAccessLevel = await this.store.findRecordByUri(
      'concept', subcaseIsConfidential
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
        this.intl.t('warning-title'),
      );
    }
    this.args.decisionActivity.report = piece;
    await this.args.decisionActivity.save();
    this.isAddingReport = false;
    await this.loadReport.perform();
  }

  @action
  async attachNewReportVersion(piece) {
    await piece.save();
    try {
      const sourceFile = await piece.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
    this.args.decisionActivity.report = piece;
    await this.args.decisionActivity.save();
    // This reload is a workaround for file-service "deleteDocumentContainer" having a stale list of pieces
    // when deleting the full container right after adding a new report version without the version history open.
    const documentContainer = await piece.documentContainer;
    await documentContainer.hasMany('pieces').reload();
    await this.loadReport.perform();
  }
}
