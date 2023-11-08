import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import generateReportName from 'frontend-kaleidos/utils/generate-report-name';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import ENV from 'frontend-kaleidos/config/environment';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import VrNotulenName, {
  compareFunction as compareNotulen,
} from 'frontend-kaleidos/utils/vr-notulen-name';
import { generateBetreft } from 'frontend-kaleidos/utils/decision-minutes-formatting';

function editorContentChanged(piecePartRecord, piecePartEditor) {
  return piecePartRecord.htmlContent !== piecePartEditor.htmlContent;
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
  @service currentSession;

  @tracked report;
  @tracked previousReport;
  @tracked annotatiePiecePart;
  @tracked betreftPiecePart;
  @tracked beslissingPiecePart;
  @tracked nota;

  @tracked hasSignFlow = false;
  @tracked hasMarkedSignFlow = false;

  @tracked isEditingAnnotation = false;
  @tracked isEditingConcern = false;
  @tracked isEditingTreatment = false;
  @tracked isEditing = false;
  @tracked isEditingPill = false;
  @tracked isAddingReport = false;

  @tracked editorValueAnnotatie = null;
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
    let pieces = await this.store.query('piece', {
      'filter[agendaitems][:id:]': this.args.agendaitem.id,
      'filter[:has-no:next-piece]': true,
    });
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
    const { betreftPiecePart, beslissingPiecePart, annotatiePiecePart } =
      this.createAndAttachPieceParts(
        report,
        this.betreftPiecePart.htmlContent,
        this.beslissingPiecePart.htmlContent,
        this.annotatiePiecePart.htmlContent
      );

    await this.saveReport.perform(
      await report.documentContainer,
      report,
      betreftPiecePart,
      beslissingPiecePart,
      annotatiePiecePart
    );
    await this.pieceAccessLevelService.updatePreviousAccessLevels(report);
    await this.loadReport.perform();
  });

  get pieceParts() {
    return !!this.betreftPiecePart
        || !!this.beslissingPiecePart
        || !!this.annotatiePiecePart;
  }

  loadAnnotatiePiecePart = task(async () => {
    this.annotatiePiecePart = await this.store.queryOne('piece-part', {
      filter: {
        report: { ':id:': this.report.id },
        ':has-no:next-piece-part': true,
        title: 'Annotatie',
      },
    });
    if (this.annotatiePiecePart) {
      this.editorValueAnnotatie = this.annotatiePiecePart.htmlContent;
    }
  });

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
      await this.loadAnnotatiePiecePart.perform();
      await this.loadBetreftPiecePart.perform();
      await this.loadBeslissingPiecePart.perform();
      this.previousReport = await this.report.previousPiece;
      this.loadSignatureRelatedData.perform();
    } else {
      this.annotatiePiecePart = null;
      this.betreftPiecePart = null;
      this.beslissingPiecePart = null;
    }
  });

  loadSignatureRelatedData = task(async () => {
    if (this.report) {
      this.hasSignFlow = await this.signatureService.hasSignFlow(this.report);
      this.hasMarkedSignFlow = await this.signatureService.hasMarkedSignFlow(this.report);
    }
  });

  onDecisionEdit = task(async () => {
    await this.updateAgendaitemPiecesAccessLevels.perform();
    await this.updatePiecesSignFlows.perform();
    await this.updateDecisionPiecePart.perform();
  });

  updateDecisionPiecePart = task(async () => {
    if (!this.report || !this.beslissingPiecePart) {
      return;
    }
    let newBeslissingHtmlContent = this.beslissingPiecePart.htmlContent;
    const decisionResultCode = await this.args.decisionActivity.decisionResultCode;
    switch (decisionResultCode?.uri) {
      case CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD:
        newBeslissingHtmlContent = this.intl.t('postponed-item-decision');
        break;
      case CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN:
        newBeslissingHtmlContent = this.intl.t('retracted-item-decision');
        break;
      default:
        break;
    }
    if (newBeslissingHtmlContent !== this.beslissingPiecePart.htmlContent) {
      const now = new Date();
      const newBeslissingPiecePart = await this.store.createRecord('piece-part', {
        title: 'Beslissing',
        htmlContent: newBeslissingHtmlContent,
        report: this.report,
        previousPiecePart: this.beslissingPiecePart,
        created: now,
      });
      await newBeslissingPiecePart.save();
      await this.decisionReportGeneration.generateReplacementReport.perform(
        this.report
      );
    }
    this.loadBeslissingPiecePart.perform();
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
    this.editorValueAnnotatie = '';
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
      editorInterface.setHtmlContent(this.betreftPiecePart.htmlContent);

      // Weird rerendering behaviour, see: https://chat.semte.ch/channel/say-editor?msg=q9gF5BfAHFWiyGv84
    } else if (this.editorInstanceBetreft) {
      editorInterface.setHtmlContent(this.editorInstanceBetreft.htmlContent);
    }

    this.editorInstanceBetreft = editorInterface;
  }

  @action
  onRevertBetreftVersion(betreftPiecePart) {
    this.setBetreftEditorContent(betreftPiecePart.htmlContent);
  }

  @action
  setBetreftEditorContent(content) {
    this.editorInstanceBetreft?.setHtmlContent(content);
  }

  @action
  async updateBetreftContent() {
    const { shortTitle, title } = this.args.agendaContext.agendaitem;
    const documents = this.pieces;
    const agendaActivity = await this.args.agendaitem.agendaActivity;
    const subcase = await agendaActivity?.subcase;
      this.setBetreftEditorContent(
        `<p>${generateBetreft(shortTitle, title, this.args.agendaitem.isApproval, documents, subcase?.subcaseName)}</p>`
      );
  }

  @action
  handleRdfaEditorInitBeslissing(editorInterface) {
    if (this.beslissingPiecePart) {
      editorInterface.setHtmlContent(this.beslissingPiecePart.htmlContent);
    } else if (this.editorInstanceBeslissing) {
      editorInterface.setHtmlContent(this.editorInstanceBeslissing.htmlContent);
    }

    this.editorInstanceBeslissing = editorInterface;
  }

  @action
  onRevertBeslissingVersion(beslissingPiecePart) {
    this.setBeslissingEditorContent(beslissingPiecePart.htmlContent);
  }

  @action
  setBeslissingEditorContent(content) {
    this.editorInstanceBeslissing?.setHtmlContent(content);
  }

  @action
  async updateBeslissingContent() {
    let newBeslissingHtmlContent;
    const decisionResultCode = await this.args.decisionActivity
      .decisionResultCode;
    switch (decisionResultCode?.uri) {
      case CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD:
        newBeslissingHtmlContent = this.intl.t('postponed-item-decision');
        break;
      case CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN:
        newBeslissingHtmlContent = this.intl.t('retracted-item-decision');
        break;
      default:
        if (this.args.agendaitem.isApproval) {
          const { shortTitle, title } = this.args.agendaContext.agendaitem;
          let beslissing = title || shortTitle || '';
          beslissing = beslissing.replace(
            /Goedkeuring van/i,
            'goedkeuring aan'
          );
          newBeslissingHtmlContent = `De Vlaamse Regering hecht haar ${beslissing}`;
          // newBeslissingHtmlContent += beslissing;
        } else {
          newBeslissingHtmlContent = this.nota || '';
        }
        break;
    }
    this.setBeslissingEditorContent(`<p>${newBeslissingHtmlContent}</p>`);
  }

  onUpdateAnnotation = task(async () => {
    const report = this.report;
    const documentContainer = await this.report.documentContainer;
    const annotatiePiecePart = this.attachNewAnnotatiePiecePartsVersion(
      report,
      this.annotatiePiecePart
    );
    await this.saveReport.perform(documentContainer, report, null, annotatiePiecePart);
    await this.loadAnnotatiePiecePart.perform();
    this.isEditingAnnotation = false;
  });

  onUpdateConcern = task(async () => {
    const report = this.report;
    const documentContainer = await this.report.documentContainer;
    const betreftPiecePart = this.attachNewBetreftPiecePartsVersion(
      report,
      this.betreftPiecePart
    );

    await this.saveReport.perform(documentContainer, report, null, betreftPiecePart);
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

    await this.saveReport.perform(documentContainer, report, beslissingPiecePart, null);
    await this.loadBeslissingPiecePart.perform();
    this.isEditingTreatment = false;
  });

  onSaveReport = task(async () => {
    let report;
    let documentContainer;
    let annotatiePiecePart;
    let betreftPiecePart;
    let beslissingPiecePart;

    if (!this.report) {
      documentContainer = this.createNewDocumentContainer();
      report = await this.createNewReport(documentContainer);
      ({ betreftPiecePart, beslissingPiecePart, annotatiePiecePart } =
        this.createAndAttachPieceParts(
          report,
          this.editorInstanceBetreft.htmlContent,
          this.editorInstanceBeslissing.htmlContent,
          this.editorValueAnnotatie
        ));
    } else {
      documentContainer = await this.report.documentContainer;
      report = this.report;
      annotatiePiecePart = this.attachNewAnnotatiePiecePartsVersion(
        report,
        this.annotatiePiecePart
      )
      betreftPiecePart = this.attachNewBetreftPiecePartsVersion(
        report,
        this.betreftPiecePart
      );
      beslissingPiecePart = this.attachNewBeslissingPiecePartsVersion(
        report,
        this.beslissingPiecePart
      );
    }

    await this.saveReport.perform(
      documentContainer,
      report,
      beslissingPiecePart,
      betreftPiecePart,
      annotatiePiecePart
    );
    await this.loadReport.perform();
    this.isEditing = false;
  });

  saveReport = task(async (
    documentContainer,
    report,
    beslissingPiecePart,
    betreftPiecePart,
    annotatiePiecePart
  ) => {
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

    await documentContainer.save();
    await report.save();
    await annotatiePiecePart?.save();
    await betreftPiecePart?.save();
    await beslissingPiecePart?.save();

    this.args.decisionActivity.report = report;

    await this.args.decisionActivity.save();

    // If this is too slow, we should make a task and do this asynchronously
    await this.decisionReportGeneration.generateReplacementReport.perform(
      report
    );
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
      name: await generateReportName(
        this.args.agendaContext.agendaitem,
        this.args.agendaContext.meeting,
      ),
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

  createAndAttachPieceParts(report, betreftContent, beslissingContent, annotatieContent) {
    const now = new Date();
    const annotatiePiecePart = this.store.createRecord('piece-part', {
      title: 'Annotatie',
      htmlContent: annotatieContent,
      report: report,
      created: now,
    });

    const betreftPiecePart = this.store.createRecord('piece-part', {
      title: 'Betreft',
      htmlContent: betreftContent,
      report: report,
      created: now,
    });

    const beslissingPiecePart = this.store.createRecord('piece-part', {
      title: 'Beslissing',
      htmlContent: beslissingContent,
      report: report,
      created: now,
    });

    return {
      annotatiePiecePart,
      betreftPiecePart,
      beslissingPiecePart,
    };
  }

  attachNewAnnotatiePiecePartsVersion(report, previousAnnotatiePiecePart) {
    const now = new Date();
    let annotatiePiecePart = null;
    if (
      previousAnnotatiePiecePart?.htmlContent !== this.editorValueAnnotatie
    ) {
      annotatiePiecePart = this.store.createRecord('piece-part', {
        title: 'Annotatie',
        htmlContent: this.editorValueAnnotatie,
        report: report,
        previousPiecePart: previousAnnotatiePiecePart,
        created: now,
      });
    }
    return annotatiePiecePart;
  }

  attachNewBetreftPiecePartsVersion(report, previousBetreftPiecePart) {
    const now = new Date();
    let betreftPiecePart = null;
    if (
      editorContentChanged(previousBetreftPiecePart, this.editorInstanceBetreft)
    ) {
      betreftPiecePart = this.store.createRecord('piece-part', {
        title: 'Betreft',
        htmlContent: this.editorInstanceBetreft.htmlContent,
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
        htmlContent: this.editorInstanceBeslissing.htmlContent,
        report: report,
        previousPiecePart: previousBeslissingPiecePart,
        created: now,
      });
    }
    return beslissingPiecePart;
  }

  get disableSaveAnnotationButton() {
    if (this.loadReport.isRunning) {
      return true;
    }

    if (!this.editorValueAnnotatie && this.editorValueAnnotatie !== '') {
      return true;
    }

    // If there is no change to the part, disable
    if (
      this.annotatiePiecePart?.htmlContent === this.editorValueAnnotatie
    ) {
      return true;
    }

    return false;
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
      this.betreftPiecePart?.htmlContent === this.editorInstanceBetreft.htmlContent
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
      this.beslissingPiecePart?.htmlContent ===
      this.editorInstanceBeslissing.htmlContent
    ) {
      return true;
    }

    return false;
  }

  get disableSaveButton() {
    if (this.disableSaveConcernButton
      || this.disableSaveTreatmentButton
      || this.disableSaveAnnotationButton) {
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

  get mayEditDecisionReport() {
    return this.enableDigitalAgenda &&
      this.currentSession.may('manage-decisions') &&
      (!this.hasSignFlow || this.hasMarkedSignFlow);
  }

  @action
  startEditingAnnotation() {
    this.isEditingAnnotation = true;
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
    this.editorValueAnnotatie = '';
    this.isEditing = true;
  }
}
