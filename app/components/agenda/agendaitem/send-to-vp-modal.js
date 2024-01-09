import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import CopyErrorToClipboardToast from 'frontend-kaleidos/components/utils/toaster/copy-error-to-clipboard-toast';

const PDF_MIME_TYPE = 'application/pdf; charset=binary';
// question: is this enough for all Word documents?
// or do we need to check more mimeTypes?
const WORD_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document; charset=binary';

export default class SendToVpModalComponent extends Component {
  @service store;
  @service conceptStore;
  @service intl;
  @service toaster;

  @tracked pgSubcasesWithPieces;
  @tracked dgSubcaseWithPieces;
  @tracked comment;

  isComplete = true;
  BESLISSINGSFICHE;
  DECREET;
  MEMORIE;
  NOTA;
  ADVIES;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get isModalDisabled() {
    return this.loadData.isRunning
      || !this.dgSubcaseWithPieces.piecesReadyToBeSent?.length;
  }

  loadData = task(async () => {
    await this.loadDocumentTypes();
    await this.loadSubcaseWithPieces();
  });

  async loadDocumentTypes() {
    this.BESLISSINGSFICHE = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.BESLISSINGSFICHE
    );
    this.DECREET = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.DECREET
    );
    this.MEMORIE = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.MEMORIE
    );
    this.NOTA = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.NOTA
    );
    this.ADVIES = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.ADVIES
    );

    const { PRINCIPIELE_GOEDKEURING, DEFINITIEVE_GOEDKEURING } =
      CONSTANTS.SUBCASE_TYPES;

    this.subcaseRequirements = {
      [PRINCIPIELE_GOEDKEURING]: [
        { type: this.BESLISSINGSFICHE, wordRequired: false, signed: true },
        { type: this.DECREET, wordRequired: true, signed: false },
        { type: this.MEMORIE, wordRequired: true, signed: false },
        { type: this.NOTA, wordRequired: false, signed: false },
        { type: this.ADVIES, wordRequired: false, signed: false },
      ],
      [DEFINITIEVE_GOEDKEURING]: [
        { type: this.BESLISSINGSFICHE, wordRequired: false, signed: true },
        { type: this.DECREET, wordRequired: true, signed: true },
        { type: this.MEMORIE, wordRequired: true, signed: true },
        { type: this.NOTA, wordRequired: false, signed: false },
        { type: this.ADVIES, wordRequired: false, signed: false },
      ],
    };
  }

  loadPiecesForSubcase = async (subcase) => {
    const subcaseTypePromise = subcase.type;
    const latestAgendaActivity = await this.store.queryOne('agenda-activity', {
      'filter[subcase][:id:]': subcase.id,
      sort: '-start-date',
    });

    if (latestAgendaActivity) {
      const latestAgendaitem = await this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': latestAgendaActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });

      const treatment = await latestAgendaitem?.treatment;
      const decisionActivity = await treatment?.decisionActivity;

      const report = await decisionActivity?.report;

      const INTERN_OVERHEID = await this.store.findRecordByUri(
        'concept',
        CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID
      );
      const PUBLIEK = await this.store.findRecordByUri(
        'concept',
        CONSTANTS.ACCESS_LEVELS.PUBLIEK
      );
      const subcasePieces = (await this.store.queryAll('piece', {
        'filter[document-container][type][:id:]': [
          this.DECREET.id,
          this.MEMORIE.id,
          this.NOTA.id,
          this.ADVIES.id,
        ].join(','),
        'filter[access-level][:id:]': [
          INTERN_OVERHEID.id,
          PUBLIEK.id,
        ].join(','),
        'filter[submission-activity][subcase][:id:]': subcase.id,
        sort: 'name',
      })).slice();

      const allPieces = report ? [report, ...subcasePieces] : subcasePieces;
      const piecesReadyToBeSent = [];

      for (const piece of allPieces) {
        const documentContainer = await piece.documentContainer;
        await documentContainer?.type;
        await piece.signedPiece;
        const file = await piece.file;
        await file.derived;
      }
      const subcaseType = await subcaseTypePromise;

      for (const piece of allPieces) {
        const submittedPieces = (await piece.submittedPieces).slice();
        if (submittedPieces.length === 0) {
          piecesReadyToBeSent.push(piece);
          continue;
        }

        let hasSentPdf = false;
        let hasSentWord = false;
        let hasSentSigned = false;
        for (const submittedPiece of submittedPieces)  {
          const file = await piece.file;
          const derived = await file.derived;
          let pdf;
          let word;
          let signed;
          if (derived) {
            pdf = derived;
            word = file;
          } else {
            pdf = file;
          }
          const signedPieceCopy = await piece.signedPieceCopy;
          signed = await signedPieceCopy?.file;

          if (submittedPiece.unsignedFile === pdf.uri) {
            hasSentPdf = true;
          }
          if (submittedPiece.wordFile === word?.uri) {
            hasSentWord = true;
          }
          if (submittedPiece.signedFile === signed?.uri) {
            hasSentSigned = true;
          }
        }
        if (!hasSentPdf || !hasSentWord || !hasSentSigned) {
          piecesReadyToBeSent.push(piece);
        }
      }

      return {
        subcase,
        allPieces,
        piecesReadyToBeSent,
        subcaseTypeUri: subcaseType.uri,
      };
    }
  };

  async loadSubcaseWithPieces() {
    this.decisionmakingFlow = await this.args.definitieveGoedkeuringSubcase
      .decisionmakingFlow;
    let dgSubcase = this.store.queryOne('subcase', {
      'filter[decisionmaking-flow][:id:]': this.decisionmakingFlow.id,
      'filter[type][:uri:]': CONSTANTS.SUBCASE_TYPES.DEFINITIEVE_GOEDKEURING,
      sort: '-created',
    });

    let pgSubcases = this.store.queryAll('subcase', {
      'filter[decisionmaking-flow][:id:]': this.decisionmakingFlow.id,
      'filter[type][:uri:]': CONSTANTS.SUBCASE_TYPES.PRINCIPIELE_GOEDKEURING,
      sort: 'created',
    });

    [dgSubcase, pgSubcases] = await Promise.all([dgSubcase, pgSubcases]);

    [this.dgSubcaseWithPieces, this.pgSubcasesWithPieces] = await Promise.all([
      this.loadPiecesForSubcase(dgSubcase),
      Promise.all(pgSubcases.toArray().map(this.loadPiecesForSubcase)),
    ]);
  }

  sendToVP = task(async () => {
    const params = new URLSearchParams({
      uri: this.decisionmakingFlow.uri,
      isComplete: this.isComplete,
      ...(this.comment ? { comment: this.comment} : null),
    });
    const response = await fetch(
      `/vlaams-parlement-sync/?${params}`,
      { headers: { Accept: 'application/vnd.api+json' }, method: 'POST' }
    );

    if (!response.ok) {
      let errorMessage = '';
      try {
        const data = await response.json();
        if (data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = JSON.stringify(data);
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          errorMessage = response.status;
        } else {
          errorMessage = `Something went wrong while reading response: ${error}`;
        }
      }
      this.toaster.show(CopyErrorToClipboardToast, {
        title: this.intl.t('warning-title'),
        message: this.intl.t('error-while-sending-to-VP-message'),
        errorContent: errorMessage,
        showDatetime: true,
        options: {
          timeOut: 60 * 10 * 1000,
        }
      });
      return;
    } else {
      this.toaster.success(this.intl.t('case-was-sent-to-VP'));
    }

    this.args?.onClose();
  });

  @action
  onChangeComment(event) {
    this.comment = event.target.value;
  }

  missingDocsForSubcase = (subcaseWithPieces) => {
    // We want to move this logic to the backend so it will always be
    // consistent with the actual data being sent.
    const formattedMissingFiles = [];
    const subcaseRequirements =
      this.subcaseRequirements[subcaseWithPieces.subcaseTypeUri];

    for (const requirement of subcaseRequirements) {
      const pieces = subcaseWithPieces.allPieces;
      const type = requirement.type;

      const hasSigned = hasSignedPieceOfType(pieces, type);
      const hasPdf = hasPieceOfType(pieces, type, PDF_MIME_TYPE);
      const hasWord = hasPieceOfType(pieces, type, WORD_MIME_TYPE);

      if (!hasPdf) {
        formattedMissingFiles.push(`${requirement.type.altLabel}`);
        this.isComplete = false;
      } else if (requirement.signed && !hasSigned && requirement.wordRequired && !hasWord) {
        formattedMissingFiles.push(`${requirement.type.altLabel} (ondertekend en in Word)`);
        this.isComplete = false;
      } else if (requirement.signed && !hasSigned) {
        formattedMissingFiles.push(`${requirement.type.altLabel} (ondertekend)`);
        this.isComplete = false;
      } else if (requirement.wordRequired && !hasWord) {
        formattedMissingFiles.push(`${requirement.type.altLabel} (in Word)`);
        this.isComplete = false;
      }
    }

    return formattedMissingFiles;
  };

  pieceFileTypes = async (piece) => {
    const file = await piece.file;
    const derived = await file.derived;
    let pdf;
    let word;
    let signed;
    if (derived) {
      pdf = derived;
      word = file;
    } else {
      pdf = file;
    }
    const signedPieceCopy = await piece.signedPieceCopy;
    signed = await signedPieceCopy?.file;

    const formatter = new Intl.ListFormat('nl-be');
    const list = [];
    if (pdf) {
      list.push('PDF');
    }
    if (word) {
      list.push('Word');
    }
    if (signed) {
      list.push('ondertekend');
    }

    if (list.length) {
      return `(${formatter.format(list)})`;
    }
    return '';
  }
}

function findPieceOfType(pieces, type, mimeType=null) {
  return pieces.find((piece) => {
    const documentContainer = piece.belongsTo('documentContainer').value();
    const pieceType = documentContainer.belongsTo('type').value();
    const sourceFile = piece.belongsTo('file').value();
    const derivedFile = sourceFile.belongsTo('derived').value();

    if (mimeType) {
      const sourceMimeType = sourceFile.format;
      const derivedMimeType = derivedFile?.format;
      return pieceType === type
        && (mimeType.includes(derivedMimeType) || mimeType.includes(sourceMimeType))
    } else {
      return pieceType === type;
    }
  });
}

function hasPieceOfType(pieces, type, mimeType) {
  return !!findPieceOfType(pieces, type, mimeType);
}

function hasSignedPieceOfType(pieces, type, mimeType=null) {
  const foundPiece = findPieceOfType(pieces, type, mimeType);
  return !!foundPiece?.belongsTo('signedPiece').value();
}
