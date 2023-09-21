import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import addLeadingZeros from 'frontend-kaleidos/utils/add-leading-zeros';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import ENV from 'frontend-kaleidos/config/environment';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import VrNotulenName,
{ compareFunction as compareNotulen } from 'frontend-kaleidos/utils/vr-notulen-name';

function editorContentChanged(piecePartRecord, piecePartEditor) {
  return piecePartRecord.value !== piecePartEditor.htmlContent;
}

function formatDocuments(pieceRecords, isApproval) {
  const names = pieceRecords.map((record) => record.name);
  const simplifiedNames = names.map((name) => {
    if (isApproval) {
      return new VrNotulenName(name).vrNumberWithSuffix();
    }
    return new VRDocumentName(name).vrNumberWithSuffix();
  });
  const formatter = new Intl.ListFormat('nl-be');
  return `(${formatter.format(simplifiedNames)})`;
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
  @service signatureService;
  @service store;
  @service toaster;
  @service decisionReportGeneration;
  @service throttledLoadingService;

  @tracked report;
  @tracked previousReport;
  @tracked betreftPiecePart;
  @tracked beslissingPiecePart;
  @tracked nota;

  @tracked isEditingConcern = false;
  @tracked isEditingTreatment = false;
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

  loadNota = task(async () => {
    const nota = await this.agendaitemNota.nota(
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
    this.nota = json.content;
  });

  loadCodelists = task(async () => {
    this.decisionDocType = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.DECISION
    );
  });

  loadDocuments = task(async () => {
    let pieces = await this.throttledLoadingService.loadPieces.perform(this.args.agendaitem);
    pieces = pieces.toArray();
    let sortedPieces;
    if (this.args.agendaitem.isApproval) {
      sortedPieces = sortPieces(pieces, VrNotulenName, compareNotulen);
    } else {
      sortedPieces = sortPieces(pieces);
    }
    this.pieces = sortedPieces;
  });

  @action
  toggleEditPill() {
    this.isEditingPill = !this.isEditingPill;
  }

  onCreateNewVersion = task(async () => {
    const report = await this.attachNewReportVersion(this.report);
    const { betreftPiecePart, beslissingPiecePart } =
      this.createAndAttachPieceParts(
        report,
        this.betreftPiecePart.value,
        this.beslissingPiecePart.value
      );

    await this.saveReport(
      await report.documentContainer,
      report,
      betreftPiecePart,
      beslissingPiecePart
    );
    await this.pieceAccessLevelService.updatePreviousAccessLevels(report);
    await this.loadReport.perform();
  });

  get pieceParts() {
    return !!this.betreftPiecePart || !!this.beslissingPiecePart;
  }

  loadBetreftPiecePart = task(async () => {
    this.betreftPiecePart = await this.store.queryOne('piece-part', {
      filter: {
        report: { ':id:': this.report.id },
        ':has-no:next-piece-part': true,
        title: 'Betreft',
      },
    });
  });

  loadBeslissingPiecePart = task(async () => {
    this.beslissingPiecePart = await this.store.queryOne('piece-part', {
      filter: {
        report: { ':id:': this.report.id },
        ':has-no:next-piece-part': true,
        title: 'Beslissing',
      },
    });
  });

  loadReport = task(async () => {
    this.report = await this.args.decisionActivity.belongsTo('report').reload();
    if (this.report) {
      await this.loadBetreftPiecePart.perform();
      await this.loadBeslissingPiecePart.perform();
      this.previousReport = await this.report.previousPiece;
    } else {
      this.betreftPiecePart = null;
      this.beslissingPiecePart = null;
    }
  });

  onDecisionEdit = task(async () => {
    await this.updateAgendaitemPiecesAccessLevels.perform();
    await this.updatePiecesSignFlows.perform();
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
      const pieces = await this.args.agendaitem.pieces;
      for (const piece of pieces.toArray()) {
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
      for (const piece of pieces.toArray()) {
        await this.signatureService.removeSignFlowForPiece(piece);
      }
    }
  });

  @action
  async didDeleteReport() {
    await this.loadReport.perform();
    this.setBetreftEditorContent('');
    this.setBeslissingEditorContent('');
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

  /**
   * Needed for uploading a PDF manually
   */
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
    await this.args.decisionActivity.save();
    this.isAddingReport = false;
    await this.loadReport.perform();
  }

  @action
  handleRdfaEditorInitBetreft(editorInterface) {
    if (this.betreftPiecePart) {
      editorInterface.setHtmlContent(this.betreftPiecePart.value);

      // Weird rerendering behaviour, see: https://chat.semte.ch/channel/say-editor?msg=q9gF5BfAHFWiyGv84
    } else if (this.editorInstanceBetreft) {
      editorInterface.setHtmlContent(this.editorInstanceBetreft.htmlContent);
    }

    this.editorInstanceBetreft = editorInterface;
  }

  @action
  onRevertBetreftVersion(betreftPiecePart) {
    this.setBetreftEditorContent(betreftPiecePart.value);
  }

  @action
  setBetreftEditorContent(content) {
    this.editorInstanceBetreft.setHtmlContent(content);
  }

  @action
  updateBetreftContent() {
    // *NOTE: approval decisions have a totally different text block.
    // possible future work, for now we make sure the documents names are correct
    const { shortTitle, title } = this.args.agendaContext.agendaitem;
    const isApproval = this.args.agendaitem.isApproval;
    const documents = this.pieces;
    this.setBetreftEditorContent(
      `<p>${shortTitle}${title ? `<br/>${title}` : ''}${
        documents ? `<br/>${formatDocuments(documents, isApproval)}` : ''
      }</p>`
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
  onRevertBeslissingVersion(beslissingPiecePart) {
    this.setBeslissingEditorContent(beslissingPiecePart.value);
  }

  @action
  setBeslissingEditorContent(content) {
    this.editorInstanceBeslissing.setHtmlContent(content);
  }

  @action
  async updateBeslissingContent() {
    this.setBeslissingEditorContent(`<p>${this.nota}</p>`);
  }

  onUpdateConcern = task(async () => {
    const report = this.report;
    const documentContainer = await this.report.documentContainer;
    const betreftPiecePart = this.attachNewBetreftPiecePartsVersion(
      report,
      this.betreftPiecePart
    );

    await this.saveReport(documentContainer, report, null, betreftPiecePart);
    await this.loadBetreftPiecePart.perform();
    this.isEditingConcern = false;
  });

  onUpdateTreatment = task(async () => {
    const report = this.report;
    const documentContainer = await this.report.documentContainer;
    const beslissingPiecePart = this.attachNewBeslissingPiecePartsVersion(
      report,
      this.beslissingPiecePart
    );

    await this.saveReport(documentContainer, report, beslissingPiecePart, null);
    await this.loadBeslissingPiecePart.perform();
    this.isEditingTreatment = false;
  });

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
      report = this.report;
      betreftPiecePart = this.attachNewBetreftPiecePartsVersion(
        report,
        this.betreftPiecePart
      );
      beslissingPiecePart = this.attachNewBeslissingPiecePartsVersion(
        report,
        this.beslissingPiecePart
      );
    }

    await this.saveReport(
      documentContainer,
      report,
      beslissingPiecePart,
      betreftPiecePart
    );
    await this.loadReport.perform();
    this.isEditing = false;
  });

  async saveReport(
    documentContainer,
    report,
    beslissingPiecePart,
    betreftPiecePart
  ) {
    await documentContainer.save();
    await report.save();
    await betreftPiecePart?.save();
    await beslissingPiecePart?.save();

    this.args.decisionActivity.report = report;

    await this.args.decisionActivity.save();

    // If this is too slow, we should make a task and do this asynchronously
    await this.decisionReportGeneration.generateReplacementReport.perform(
      report
    );
  }

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
      isReportOrMinutes: true,
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
      isReportOrMinutes: true,
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

  attachNewBetreftPiecePartsVersion(report, previousBetreftPiecePart) {
    const now = new Date();
    let betreftPiecePart = null;
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
    return betreftPiecePart;
  }

  attachNewBeslissingPiecePartsVersion(report, previousBeslissingPiecePart) {
    const now = new Date();
    let beslissingPiecePart = null;
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
    return beslissingPiecePart;
  }

  get disableSaveConcernButton() {
    if (this.loadReport.isRunning) {
      return true;
    }

    if (!this.editorInstanceBetreft) {
      return true;
    }

    // If editor is empty, disable
    if (
      this.editorInstanceBetreft.mainEditorState.doc.textContent.length === 0
    ) {
      return true;
    }

    // If there is no change to the part, disable
    if (
      this.betreftPiecePart?.value === this.editorInstanceBetreft.htmlContent
    ) {
      return true;
    }

    return false;
  }

  get disableSaveTreatmentButton() {
    if (this.loadReport.isRunning) {
      return true;
    }

    if (!this.editorInstanceBeslissing) {
      return true;
    }

    // If editor is empty, disable
    if (
      this.editorInstanceBeslissing.mainEditorState.doc.textContent.length === 0
    ) {
      return true;
    }

    // If there is no change to the part, disable
    if (
      this.beslissingPiecePart?.value ===
      this.editorInstanceBeslissing.htmlContent
    ) {
      return true;
    }

    return false;
  }

  get disableSaveButton() {
    if (this.disableSaveConcernButton || this.disableSaveTreatmentButton) {
      return true;
    }
    return false;
  }

  get enableDigitalAgenda() {
    return (
      ENV.APP.ENABLE_DIGITAL_AGENDA === 'true' ||
      ENV.APP.ENABLE_DIGITAL_AGENDA === true
    );
  }

  @action
  startEditingConcern() {
    this.loadDocuments.perform();
    this.loadNota.perform();
    this.isEditingConcern = true;
  }

  @action
  startEditingTreatment() {
    this.loadDocuments.perform();
    this.loadNota.perform();
    this.isEditingTreatment = true;
  }

  @action
  startEditing() {
    this.loadDocuments.perform();
    this.loadNota.perform();
    this.isEditing = true;
  }
}
