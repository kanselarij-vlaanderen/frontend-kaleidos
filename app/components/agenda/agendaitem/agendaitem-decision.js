import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isEmpty } from '@ember/utils';

function editorContentChanged(piecePartRecord, piecePartEditor) {
  return piecePartRecord.value !== piecePartEditor.htmlContent;
}

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

  @tracked isEditing = false;
  @tracked isEditingPill = false;
  @tracked isAddingReport = false;

  @tracked editorInstanceBeslissing = null;
  @tracked editorInstanceBetreft = null;

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

  @action
  toggleEditPill() {
    this.isEditingPill = !this.isEditingPill;
  }

  loadReport = task(async () => {
    this.report = await this.args.decisionActivity.report;
  });

  updateAgendaitemPiecesAccessLevels = task(async () => {
    const decisionResultCode = await this.args.decisionActivity
      .decisionResultCode;
    if (
      [
        CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD,
        CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN,
      ].includes(decisionResultCode.uri)
    ) {
      const pieces = this.args.agendaitem.pieces;
      for (const piece of pieces.toArray()) {
        await this.pieceAccessLevelService.strengthenAccessLevelToInternRegering(
          piece
        );
      }
    }
    this.toggleEditPill();
  });

  @action
  async attachReport() {
    const now = new Date();
    const piece = this.store.createRecord('report', {
      created: now,
      modified: now,
      name: 'TODO WHAT TO PUT HERE????',
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

    await this.loadReport.perform();
  }

  @action
  showDocument() {
    console.log('Implement me!');
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
    editorInterface.setHtmlContent(this.betreftPiecePart?.value ?? '');
  }

  @action
  handleRdfaEditorInitBeslissing(editorInterface) {
    this.editorInstanceBeslissing = editorInterface;
    editorInterface.setHtmlContent(this.beslissingPiecePart?.value ?? '');
  }

  saveReport = task(async () => {
    if (!this.report) {
      await this.attachReport();
    }

    if (isEmpty(await this.report.pieceParts)) {
      await this.attachPieceParts();
    } else {
      await this.updatePieceParts();
    }

    this.isEditing = false;
  });

  @action
  async attachPieceParts() {
    await this.store
      .createRecord('piece-part', {
        title: 'Betreft',
        value: this.editorInstanceBetreft.htmlContent,
        report: this.report,
      })
      .save();

    await this.store
      .createRecord('piece-part', {
        title: 'Beslissing',
        value: this.editorInstanceBeslissing.htmlContent,
        report: this.report,
      })
      .save();
  }

  @action
  async updatePieceParts() {
    const betreftPiecePart = this.betreftPiecePart;
    const beslissingPiecePart = this.beslissingPiecePart;

    // Check again because only one of the editors might have changed
    if (editorContentChanged(betreftPiecePart, this.editorInstanceBetreft)) {
      betreftPiecePart.report = null;
      await this.store
        .createRecord('piece-part', {
          title: 'Betreft',
          value: this.editorInstanceBetreft.htmlContent,
          report: this.report,
          previousPiecePart: betreftPiecePart,
        })
        .save();
      await betreftPiecePart.save();
    }

    if (
      editorContentChanged(beslissingPiecePart, this.editorInstanceBeslissing)
    ) {
      beslissingPiecePart.report = null;
      await this.store
        .createRecord('piece-part', {
          title: 'Beslissing',
          value: this.editorInstanceBeslissing.htmlContent,
          report: this.report,
          previousPiecePart: beslissingPiecePart,
        })
        .save();
      await beslissingPiecePart.save();
    }

    await this.report.save();
  }

  get disableSaveButton() {
    if (this.loadReport.isRunning) {
      return true;
    }

    if (!this.editorInstanceBetreft || !this.editorInstanceBeslissing) {
      return true;
    }

    // If any editor is empty, disable
    if (
      this.editorInstanceBeslissing.mainEditorState.doc.textContent.length ===
        0 ||
      this.editorInstanceBetreft.mainEditorState.doc.textContent.length === 0
    ) {
      return true;
    }

    // If there is no change to any of the parts, disable
    if (
      this.beslissingPiecePart?.value ===
        this.editorInstanceBeslissing.htmlContent &&
      this.betreftPiecePart?.value === this.editorInstanceBetreft.htmlContent
    ) {
      return true;
    }

    return false;
  }

  get betreftPiecePart() {
    return this.report?.pieceParts?.find((x) => x.title === 'Betreft');
  }

  get beslissingPiecePart() {
    return this.report?.pieceParts?.find((x) => x.title === 'Beslissing');
  }
}
