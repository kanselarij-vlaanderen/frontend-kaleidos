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
  editorInstance;

  @service currentSession;
  @service store;
  @service pieceAccessLevelService;

  @tracked report;
  @tracked previousReport;

  @tracked isEditing = false;
  @tracked isEditingPill = false;
  @tracked isSigned = true;
  @tracked isFullscreen = false;
  @tracked isAddingReport = false;

  @tracked decisionDocType;

  @action
  toggleAll() {
    this.isFullscreen = false;
    this.isEditing = false;
  }

  @action
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  @action
  toggleSigned() {
    this.isSigned = !this.isSigned;
  }

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
  toggleEditPill() {
    this.isEditingPill = !this.isEditingPill;
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
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

    await documentContainer.save();
    piece.setProperties({
      accessLevel: defaultAccessLevel,
      documentContainer,
    });
    await piece.save();
    this.args.decisionActivity.report = piece;
    await this.args.decisionActivity.save();
    this.isAddingReport = false;
    await this.loadReport.perform();
  }

  @action
  async attachNewReportVersion(piece) {
    await piece.save();
    this.args.decisionActivity.report = piece;
    await this.args.decisionActivity.save();
    // This reload is a workaround for file-service "deleteDocumentContainer" having a stale list of pieces
    // when deleting the full container right after adding a new report version without the version history open.
    const documentContainer = await piece.documentContainer;
    await documentContainer.hasMany('pieces').reload();
    await this.loadReport.perform();
  }

  @action
  handleRdfaEditorInit(editorInterface) {
    this.editorInstance = editorInterface;
    editorInterface.setHtmlContent(
      '<h4>Betreft :</h4>' +
      '<p>Toegang havens<br/>Voorontwerp van koninklijk besluit betreffende het verbieden van toegang tot de Belgische havens door gesanctioneerde schepen<br/>Betrokkenheid van de Vlaamse Regering<br/>Standpuntbepaling<br/>(VR 2022 3009 DOC.1056/1 en DOC.1056/2)</p>' + 
      '<h4>Beslissing :</h4>' +
      '<p>De Vlaamse Regering beslist:</p>' +
      '<ol><li>in te stemmen met bovengenoemd voorontwerp van koninklijk besluit;</li><li>de minister-president van de Vlaamse Regering te gelasten de federale minister van Noordzee van deze beslissing in kennis te stellen.</li></ol>'
    )
  }
}
