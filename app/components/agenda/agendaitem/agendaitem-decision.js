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
  @tracked isEditingPill = false;
  @tracked isAddingReport = false;

  @tracked decisionDocType;

  constructor() {
    super(...arguments);
    this.loadReport.perform();
    this.loadCodelists.perform();
  }

  @task
  *loadCodelists() {
    this.decisionDocType = yield this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.DECISION
    );
  }

  @action
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  @action toggleEditPill() {
    this.isEditingPill = !this.isEditingPill;
  }

  @action
  toggleIsAddingReport() {
    this.isAddingReport = !this.isAddingReport;
  }

  @action
  showDocument() {
    console.log('Implement me!');
  }

  @task
  *loadReport() {
    this.report = yield this.args.decisionActivity.report;
    this.previousReport = yield this.report?.previousPiece;
  }

  @task
  *updateAgendaitemPiecesAccessLevels() {
    const decisionResultCode = yield this.args.decisionActivity
      .decisionResultCode;
    if (
      [
        CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD,
        CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN,
      ].includes(decisionResultCode.uri)
    ) {
      const pieces = this.args.agendaitem.pieces;
      for (const piece of pieces.toArray()) {
        yield this.pieceAccessLevelService.strengthenAccessLevelToInternRegering(
          piece
        );
      }
    }
    this.toggleEditPill();
  }

  @action
  async attachReport() {
    const now = new Date();
    const piece = this.store.createRecord('report', {
      created: now,
      modified: now,
      name: 'TODO WHAT TO PUT HERE????'
    });

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

    this.args.decisionActivity.report = piece;
    await this.args.decisionActivity.save();
    this.isAddingReport = false;
    await this.loadReport.perform();
  }

  // @action
  // async attachNewReportVersion(piece) {
  //   await piece.save();
  //   this.args.decisionActivity.report = piece;
  //   await this.args.decisionActivity.save();

  //   // This should happen in document-card but isn't reached.
  //   await this.pieceAccessLevelService.updatePreviousAccessLevel(piece);

  //   // This reload is a workaround for file-service "deleteDocumentContainer" having a stale list of pieces
  //   // when deleting the full container right after adding a new report version without the version history open.
  //   const documentContainer = await piece.documentContainer;
  //   await documentContainer.hasMany('pieces').reload();
  //   await this.loadReport.perform();
  // }

  @action
  handleRdfaEditorInitBetreft(editorInterface) {
    this.editorInstanceBetreft = editorInterface;
    editorInterface.setHtmlContent(
      '<p>Toegang havens<br/>Voorontwerp van koninklijk besluit betreffende het verbieden van toegang tot de Belgische havens door gesanctioneerde schepen<br/>Betrokkenheid van de Vlaamse Regering<br/>Standpuntbepaling<br/>(VR 2022 3009 DOC.1056/1 en DOC.1056/2)</p>'
    );
  }

  @action
  handleRdfaEditorInitBeslissing(editorInterface) {
    this.editorInstanceBeslissing = editorInterface;
    editorInterface.setHtmlContent(
      '<ol><li>in te stemmen met bovengenoemd voorontwerp van koninklijk besluit;</li><li>de minister-president van de Vlaamse Regering te gelasten de federale minister van Noordzee van deze beslissing in kennis te stellen.</li></ol>'
    );
  }

  @action
  async savePieceParts() {
    if (!this.report) {
      await this.attachReport();
    }

    await this.store.createRecord('piece-part', {
      title: 'Betreft',
      value: this.editorInstanceBetreft.htmlContent,
      report: this.report,
    }).save();

    await this.store.createRecord('piece-part', {
      title: 'Beslissing',
      value: this.editorInstanceBeslissing.htmlContent,
      report: this.report,
    }).save();
  }
}
