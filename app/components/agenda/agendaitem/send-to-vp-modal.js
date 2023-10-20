import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

function findPieceOfType(pieces, type, mimeType) {
  return pieces.find((piece) => {
    const documentContainer = piece.belongsTo('documentContainer').value();
    const pieceType = documentContainer.belongsTo('type').value();

    if (mimeType) {
      const pieceMimeType = piece.belongsTo('file').value().format;
      debugger;
      return pieceType === type && pieceMimeType === mimeType;
    } else {
      return pieceType === type;
    }
  });
}

function hasPieceOfType(pieces, type, mimeType) {
  return !!findPieceOfType(pieces, type, mimeType);
}

function hasSignedPieceOfType(pieces, type, mimeType) {
  const foundPiece = findPieceOfType(pieces, type, mimeType);

  return !!foundPiece?.belongsTo('signedPiece').value();
}

export default class SendToVpModalComponent extends Component {
  @service store;
  @service conceptStore;

  @tracked principieleGoedkeuringPieces;
  @tracked definitieveGoedkeuringPieces;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    await Promise.all([this.loadPieces(), this.loadDocumentTypes()]);
  });

  async loadPieces() {
    this.definitieveGoedkeuringPieces = this.store.query('piece', {
      'filter[agendaitems][:id:]': this.args.agendaitem.id,
      include: 'document-container.type,signed-piece,file',
    });
    this.principieleGoedkeuringPieces = (async () => [])();

    // Get principiele goedkeuring subcase
    const decisionmakingFlow = await this.args.definitieveGoedkeuringSubcase
      .decisionmakingFlow;
    const pgSubcase = await this.store.queryOne('subcase', {
      'filter[decisionmaking-flow][:id:]': decisionmakingFlow.id,
      'filter[type][:uri:]': CONSTANTS.SUBCASE_TYPES.PRINCIPIELE_GOEDKEURING,
    });

    const latestAgendaActivity = await this.store.queryOne('agenda-activity', {
      'filter[subcase][:id:]': pgSubcase.id,
      sort: '-start-date',
    });

    if (latestAgendaActivity) {
      const latestAgendaitem = await this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': latestAgendaActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });

      this.principieleGoedkeuringPieces = this.store.query('piece', {
        'filter[agendaitems][:id:]': latestAgendaitem.id,
        include: 'document-container.type,signed-piece,file',
      });
    }

    [this.definitieveGoedkeuringPieces, this.principieleGoedkeuringPieces] =
      await Promise.all([
        this.definitieveGoedkeuringPieces,
        this.principieleGoedkeuringPieces,
      ]);
  }

  async loadDocumentTypes() {
    this.documentTypes = await this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES
    );
  }

  get missingDocs() {
    const BESLISSINGSFICHE = this.documentTypes.find(
      (type) => type.uri === CONSTANTS.DOCUMENT_TYPES.BESLISSINGSFICHE
    );

    const ONTWERPDECREET = this.documentTypes.find(
      (type) => type.uri === CONSTANTS.DOCUMENT_TYPES.ONTWERPDECREET
    );

    const MEMORIE = this.documentTypes.find(
      (type) => type.uri === CONSTANTS.DOCUMENT_TYPES.MEMORIE
    );

    const NOTA = this.documentTypes.find(
      (type) => type.uri === CONSTANTS.DOCUMENT_TYPES.NOTA
    );

    const ADVIES = this.documentTypes.find(
      (type) => type.uri === CONSTANTS.DOCUMENT_TYPES.ADVIES
    );

    const pgkSpec = [
      { type: BESLISSINGSFICHE, wordRequired: false, signed: true },
      { type: ONTWERPDECREET, wordRequired: true, signed: false },
      { type: MEMORIE, wordRequired: true, signed: false },
      { type: NOTA, wordRequired: false, signed: false },
      { type: ADVIES, wordRequired: false, signed: false },
    ];

    const dgkSpec = [
      { type: BESLISSINGSFICHE, wordRequired: false, signed: true },
      { type: ONTWERPDECREET, wordRequired: true, signed: true },
      { type: MEMORIE, wordRequired: true, signed: true },
      { type: NOTA, wordRequired: false, signed: false },
      { type: ADVIES, wordRequired: false, signed: false },
    ];

    const formattedMissingFiles = [];

    for (const subcase of [
      {
        pieces: this.principieleGoedkeuringPieces,
        name: ' principiele',
        spec: pgkSpec,
      },
      {
        pieces: this.definitieveGoedkeuringPieces,
        name: ' definitieve',
        spec: dgkSpec,
      },
    ]) {
      for (const docSpec of subcase.spec) {
        if (
          docSpec.signed &&
          !hasSignedPieceOfType(subcase.pieces, docSpec.type)
        ) {
          formattedMissingFiles.push(
            `${docSpec.type.altLabel} van ${subcase.name} goedkeuring (ondertekend)`
          );
        } else if (
          !hasPieceOfType(
            subcase.pieces,
            docSpec.type,
            'application/pdf; charset=binary'
          )
        ) {
          formattedMissingFiles.push(
            `${docSpec.type.altLabel} van ${subcase.name} goedkeuring`
          );
        }

        if (
          docSpec.wordRequired &&
          !hasPieceOfType(
            subcase.pieces,
            docSpec.type,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document; charset=binary'
          )
        ) {
          formattedMissingFiles.push(
            `${docSpec.type.altLabel} van ${subcase.name} goedkeuring (in Word)`
          );
        }
      }
    }

    return formattedMissingFiles;
  }
}
