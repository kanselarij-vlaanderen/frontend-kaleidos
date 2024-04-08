import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class CasesParliamentNewestDocumentsPanelComponent extends Component {
  @service store;

  @tracked piecesBySubcase = {};

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    const submittedPieces = await this.store.queryAll('submitted-piece', {
      'filter[parliament-submission-activity][:id:]': this.args.submissionActivities
        .map((x) => x.id)
        .join(','),
      'filter[piece][:has-no:next-piece]': true,
      sort: '-parliament-submission-activity.start-date',
      include: 'piece',
    });

    const uniquePieces = mergeDuplicatePieces(submittedPieces.slice());

    const piecesBySubcase = uniquePieces.reduce((acc, submittedPiece) => {
      const { subcaseName } = submittedPiece;
      if (subcaseName) {
        acc[subcaseName] = acc[subcaseName] ?? [];
        acc[subcaseName].push(submittedPiece);
      } else {
        acc[''] = acc[''] ?? [];
        acc[''].push(submittedPiece);
      }
      return acc;
    }, {});

    this.piecesBySubcase = piecesBySubcase;
  });

  submittedPieceList = (submittedPiece) => {
    const formatter = new Intl.ListFormat('nl-be');
    const list = [];
    if (submittedPiece.unsignedFile) {
      list.push('PDF');
    }
    if (submittedPiece.wordFile) {
      list.push('Word');
    }
    if (submittedPiece.signedFile) {
      list.push('ondertekende PDF');
    }

    if (list.length) {
      return `(${formatter.format(list)})`;
    }
    return '';
  }
}

/* Pieces can be submitted multiple times, with a different file */
function mergeDuplicatePieces(submittedPieces) {
  const uniquePieces = [];
  for (const submittedPiece of submittedPieces) {
    const piece = submittedPiece.belongsTo('piece').value();
    const uniquePiece = uniquePieces.find((p) => {
      return p.belongsTo('piece').value().id === piece.id
    });
    if (!uniquePiece) {
      uniquePieces.push(submittedPiece);
    } else {
      uniquePiece.unsignedFile = uniquePiece.unsignedFile ?? submittedPiece.unsignedFile;
      uniquePiece.wordFile = uniquePiece.wordFile ?? submittedPiece.wordFile;
      uniquePiece.signedFile = uniquePiece.signedFile ?? submittedPiece.signedFile;
    }
  }
  return uniquePieces;
}
