import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isEmpty } from '@ember/utils';
import addLeadingZeros from 'frontend-kaleidos/utils/add-leading-zeros';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import { trackedFunction } from 'ember-resources/util/function';
import { deleteFile } from 'frontend-kaleidos/utils/document-delete-helpers';

function editorContentChanged(piecePartRecord, piecePartEditor) {
  return piecePartRecord.value !== piecePartEditor.htmlContent;
}

/**
 * @argument agendaitem
 * @argument decisionActivity
 */
export default class AgendaitemDecisionComponent extends Component {
  @service agendaitemNota;
  @service fileConversionService;
  @service intl;
  @service pieceAccessLevelService;
  @service store;
  @service toaster;

  @tracked report;
  @tracked previousReport;
  @tracked betreftPiecePart;
  @tracked beslissingPiecePart;
  @tracked nota;

  @tracked isEditing = false;
  @tracked isEditingPill = false;
  @tracked isAddingReport = false;
  @tracked saveAsNewVersion = false;

  @tracked editorInstanceBeslissing = null;
  @tracked editorInstanceBetreft = null;
  @tracked decisionViewerElement = null;

  @tracked decisionDocType;

  constructor() {
    super(...arguments);
    this.loadReport.perform();
    this.loadCodelists.perform();
    this.loadNota.perform();
  }

  loadNota = task(async () => {
    const nota = await this.agendaitemNota.notaOrVisieNota(
      this.args.agendaContext.agendaitem
    );
    if (!nota) {
      return;
    }

    const resp = await fetch(`/decision-extraction/${nota.id}`);
    if (!resp.ok) {
      this.toaster.warning(this.intl.t('error-while-fetching-nota-content'));
      return;
    }

    const json = await resp.json();
    console.log(json.content);
    this.nota = json.content;
  });

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
    if (this.report) {
      this.betreftPiecePart = await this.store.queryOne('piece-part', {
        filter: {
          report: { ':id:': this.report.id },
          ':has-no:next-piece-part': true,
          title: 'Betreft',
        },
      });
      this.beslissingPiecePart = await this.store.queryOne('piece-part', {
        filter: {
          report: { ':id:': this.report.id },
          ':has-no:next-piece-part': true,
          title: 'Beslissing',
        },
      });
    }
    this.previousReport = await this.report?.previousPiece;
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

  /**
   * Deprecated but needed for backwards compat
   */
  @action
  async attachNewReportVersionDepr(piece) {
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
  setDecisionViewerElement(element) {
    this.decisionViewerElement = element;
  }

  exportPdf = task(async (report) => {
    const resp = await fetch(`/generate-decision-report/${report.id}`);
    if (!resp.ok) {
      this.toaster.error(this.intl.t('error-while-exporting-pdf'));
      return;
    }
    return await resp.json();
  });

  async replaceReportFile(report, fileId) {
    await deleteFile(report.file);
    const file = await this.store.findRecord('file', fileId);
    report.file = file;
    report.modified = new Date();
  }

  @action
  handleRdfaEditorInitBetreft(editorInterface) {
    if (this.betreftPiecePart) {
      editorInterface.setHtmlContent(this.betreftPiecePart.value);
    } else if (this.editorInstanceBetreft) {
      editorInterface.setHtmlContent(this.editorInstanceBetreft.htmlContent);
    }

    this.editorInstanceBetreft = editorInterface;
  }

  @action
  setBetreftEditorContent(content) {
    this.editorInstanceBetreft.setHtmlContent(content);
  }

  @action
  updateBetreftContent() {
    this.setBetreftEditorContent(
      `<p>${this.args.agendaContext.agendaitem.shortTitle}</p>`
    );
  }

  @action
  handleRdfaEditorInitBeslissing(editorInterface) {
    if (this.beslissingPiecePart) {
      editorInterface.setHtmlContent(this.beslissingPiecePart.value);
    } else if (this.editorInstanceBeslissing) {
      editorInterface.setHtmlContent(this.editorInstanceBeslissing.htmlContent);
    }

    this.editorInstanceBeslissing = editorInterface;
  }

  @action
  setBeslissingEditorContent(content) {
    this.editorInstanceBeslissing.setHtmlContent(content);
  }

  @action
  async updateBeslissingContent() {
    this.setBeslissingEditorContent(`<p>${this.nota}</p>`);
  }

  onSaveReport = task(async () => {
    let report;
    let documentContainer;
    let betreftPiecePart;
    let beslissingPiecePart;

    if (!this.report) {
      documentContainer = this.createNewDocumentContainer();
      report = await this.createNewReport(documentContainer);
      ({ betreftPiecePart, beslissingPiecePart } =
        this.createAndAttachPieceParts(
          report,
          this.editorInstanceBetreft.htmlContent,
          this.editorInstanceBeslissing.htmlContent
        ));
    } else {
      documentContainer = await this.report.documentContainer;
      if (this.saveAsNewVersion) {
        report = await this.attachNewReportVersion(this.report);
        ({ betreftPiecePart, beslissingPiecePart } =
          this.createAndAttachPieceParts(
            report,
            this.editorInstanceBetreft.htmlContent,
            this.editorInstanceBeslissing.htmlContent
          ));
      } else {
        report = this.report;
        ({ betreftPiecePart, beslissingPiecePart } =
          this.attachNewPiecePartsVersion(
            report,
            this.betreftPiecePart,
            this.beslissingPiecePart
          ));
      }
    }

    await documentContainer.save();
    await report.save();
    await betreftPiecePart?.save();
    await beslissingPiecePart?.save();

    this.args.decisionActivity.report = report;

    await this.args.decisionActivity.save();

    // If this is too slow, we should make a task and do this asynchronously
    const fileMeta = await this.exportPdf.perform(report);
    await this.replaceReportFile(report, fileMeta.id);

    await report.save();

    await this.loadReport.perform();

    this.saveAsNewVersion = false;
    this.isEditing = false;
  });

  createNewDocumentContainer() {
    const documentContainer = this.store.createRecord('document-container', {
      created: new Date(),
      type: this.decisionDocType,
    });

    return documentContainer;
  }

  async createNewReport(documentContainer) {
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

    const subcase = await this.args.decisionActivity.subcase;
    const subcaseIsConfidential = subcase?.confidential;

    const defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      subcaseIsConfidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID
    );

    report.setProperties({
      accessLevel: defaultAccessLevel,
      documentContainer,
    });

    return report;
  }

  async attachNewReportVersion(previousReport) {
    const now = new Date();
    let newName;
    try {
      newName = new VRDocumentName(previousReport.name).withOtherVersionSuffix(
        (await (await previousReport.documentContainer).pieces).length + 1
      );
    } catch (e) {
      newName = previousReport.name;
    }
    const report = this.store.createRecord('report', {
      name: newName,
      created: now,
      modified: now,
      previousPiece: previousReport,
      accessLevel: previousReport.accessLevel,
      documentContainer: previousReport.documentContainer,
    });

    return report;
  }

  createAndAttachPieceParts(report, betreftContent, beslissingContent) {
    const now = new Date();
    const betreftPiecePart = this.store.createRecord('piece-part', {
      title: 'Betreft',
      value: betreftContent,
      report: report,
      created: now,
    });

    const beslissingPiecePart = this.store.createRecord('piece-part', {
      title: 'Beslissing',
      value: beslissingContent,
      report: report,
      created: now,
    });

    return {
      betreftPiecePart,
      beslissingPiecePart,
    };
  }

  attachNewPiecePartsVersion(
    report,
    previousBetreftPiecePart,
    previousBeslissingPiecePart
  ) {
    const now = new Date();

    let betreftPiecePart = null;
    let beslissingPiecePart = null;

    if (
      editorContentChanged(previousBetreftPiecePart, this.editorInstanceBetreft)
    ) {
      betreftPiecePart = this.store.createRecord('piece-part', {
        title: 'Betreft',
        value: this.editorInstanceBetreft.htmlContent,
        report: report,
        previousPiecePart: previousBetreftPiecePart,
        created: now,
      });
    }

    if (
      editorContentChanged(
        previousBeslissingPiecePart,
        this.editorInstanceBeslissing
      )
    ) {
      beslissingPiecePart = this.store.createRecord('piece-part', {
        title: 'Beslissing',
        value: this.editorInstanceBeslissing.htmlContent,
        report: report,
        previousPiecePart: previousBeslissingPiecePart,
        created: now,
      });
    }

    return {
      betreftPiecePart,
      beslissingPiecePart,
    };
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
}
