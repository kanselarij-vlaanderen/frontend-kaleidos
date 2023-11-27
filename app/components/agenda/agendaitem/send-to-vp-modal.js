import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    await Promise.all([this.loadSubcaseWithPieces(), this.loadDocumentTypes()]);
  });

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

      const agendaitemPieces = await latestAgendaitem.pieces;
      let pieces = report ? [report, ...agendaitemPieces] : agendaitemPieces;
      for (const piece of pieces) {
        const documentContainer = await piece.documentContainer;
        await documentContainer?.type;
        await piece.signedPiece;
        const file = await piece.file;
        await file.derived;
      }
      const subcaseType = await subcaseTypePromise;
      return {
        subcase,
        pieces,
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
      ...(this.comment ? { comment: this.comment} : null),
    });
    const resp = await fetch(
      `/vlaams-parlement-sync/?${params}`,
      { headers: { Accept: 'application/vnd.api+json' }, method: 'POST' }
    );

    if (!resp.ok) {
      this.toaster.error(this.intl.t('error-while-sending-to-VP'));
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

  async loadDocumentTypes() {
    const BESLISSINGSFICHE = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.BESLISSINGSFICHE
    );
    const DECREET = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.DECREET
    );
    const MEMORIE = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.MEMORIE
    );
    const NOTA = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.NOTA
    );
    const ADVIES = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.ADVIES
    );

    const { PRINCIPIELE_GOEDKEURING, DEFINITIEVE_GOEDKEURING } =
      CONSTANTS.SUBCASE_TYPES;

    this.subcaseRequirements = {
      [PRINCIPIELE_GOEDKEURING]: [
        { type: BESLISSINGSFICHE, wordRequired: false, signed: true },
        { type: DECREET, wordRequired: true, signed: false },
        { type: MEMORIE, wordRequired: true, signed: false },
        { type: NOTA, wordRequired: false, signed: false },
        { type: ADVIES, wordRequired: false, signed: false },
      ],
      [DEFINITIEVE_GOEDKEURING]: [
        { type: BESLISSINGSFICHE, wordRequired: false, signed: true },
        { type: DECREET, wordRequired: true, signed: true },
        { type: MEMORIE, wordRequired: true, signed: true },
        { type: NOTA, wordRequired: false, signed: false },
        { type: ADVIES, wordRequired: false, signed: false },
      ],
    };
  }

  missingDocsForSubcase = (subcaseWithPieces) => {
    // We want to move this logic to the backend so it will always be
    // consistent with the actual data being sent.
    const formattedMissingFiles = [];
    const subcaseRequirements =
      this.subcaseRequirements[subcaseWithPieces.subcaseTypeUri];

    for (const requirement of subcaseRequirements) {
      const pieces = subcaseWithPieces.pieces;
      const type = requirement.type;

      const hasSigned = hasSignedPieceOfType(pieces, type);
      const hasPdf = hasPieceOfType(pieces, type, PDF_MIME_TYPE);
      const hasWord = hasPieceOfType(pieces, type, WORD_MIME_TYPE);

      if (!hasPdf) {
        formattedMissingFiles.push(`${requirement.type.altLabel}`);
      } else if (requirement.signed && !hasSigned && requirement.wordRequired && !hasWord) {
        formattedMissingFiles.push(`${requirement.type.altLabel} (ondertekend en in Word)`);
      } else if (requirement.signed && !hasSigned) {
        formattedMissingFiles.push(`${requirement.type.altLabel} (ondertekend)`);
      } else if (requirement.wordRequired && !hasWord) {
        formattedMissingFiles.push(`${requirement.type.altLabel} (in Word)`);
      }
    }

    return formattedMissingFiles;
  };
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
