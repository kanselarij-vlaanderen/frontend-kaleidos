import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isEmpty } from '@ember/utils';
import addLeadingZeros from 'frontend-kaleidos/utils/add-leading-zeros';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';

function editorContentChanged(piecePartRecord, piecePartEditor) {
  return piecePartRecord.value !== piecePartEditor.htmlContent;
}

/**
 * @argument agendaitem
 * @argument decisionActivity
 */
export default class AgendaitemDecisionComponent extends Component {
  @service currentSession;
  @service fileConversionService;
  @service pieceAccessLevelService;
  @service store;
  @service toaster;
  @service intl;

  @tracked report;

  @tracked isEditing = false;
  @tracked isEditingPill = false;
  @tracked isAddingReport = false;

  @tracked editorInstanceBeslissing = null;
  @tracked editorInstanceBetreft = null;
  @tracked decisionViewerElement = null;

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
    const report = this.store.createRecord('report', {
      created: now,
      modified: now,
      name: `${
        this.args.agendaContext.meeting.numberRepresentation
      } - punt ${addLeadingZeros(
        this.args.agendaContext.agendaitem.number,
        4
      )}`,
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
    report.setProperties({
      accessLevel: defaultAccessLevel,
      documentContainer,
    });
    await report.save();

    this.args.decisionActivity.report = report;

    await this.args.decisionActivity.save();
    await this.loadReport.perform();
  }

  @action
  async updateReport() {
    const previousReport = this.report;
    const now = new Date();
    let newName;
    try {
      newName = new VRDocumentName(previousReport.name).withOtherVersionSuffix(
        (await (await previousReport.documentContainer).pieces).length + 1
      );
    } catch (e) {
      newName = previousReport.name;
    }
    this.report = await this.store
      .createRecord('report', {
        name: newName,
        created: now,
        modified: now,
        previousPiece: previousReport,
        accessLevel: previousReport.accessLevel,
        documentContainer: previousReport.documentContainer,
      })
      .save();
    await previousReport.save();
    this.args.decisionActivity.report = this.report;
    await this.args.decisionActivity.save();
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
  setDecisionViewerElement(element) {
    this.decisionViewerElement = element;
  }

  exportPdf = task(async () => {
    const resp = await fetch(`/generate-decision-report/${this.report.id}`);
    if (!resp.ok) {
      this.toaster.error(this.intl.t('error-while-exporting-pdf'));
      return;
    }
    const fileMeta = await resp.json();
    this.report.file = await this.store.findRecord('file', fileMeta.id);
    this.report.modified = new Date();
    await this.report.save();
  });

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

  onSaveReport = task(async () => {
    if (!this.report) {
      await this.attachReport();
    }

    // To make sure the content of the PDF matches the piece parts,
    // we need to create a new report version here
    if (await this.report.file) {
      await this.updateReport();
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
