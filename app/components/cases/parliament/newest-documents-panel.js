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
    const subcase = await this.args.parliamentFlow.parliamentSubcase;
    const submissionActivities = await this.store.queryAll(
      'parliament-submission-activity',
      {
        'filter[parliament-subcase][:id:]': subcase.id,
      }
    );

    const submittedPieces = await this.store.queryAll('submitted-piece', {
      'filter[parliament-submission-activity][:id:]': submissionActivities
        .map((x) => x.id)
        .join(','),
      sort: '-parliament-submission-activity.start-date',
      include: 'piece',
    });

    const uniquePieces = removeDuplicatePiece(submittedPieces.slice());

    const piecesBySubcase = uniquePieces.reduce((acc, submittedPiece) => {
      const { subcaseName } = submittedPiece;
      acc[subcaseName] = acc[subcaseName] ?? [];
      acc[subcaseName].push(submittedPiece);
      return acc;
    }, {});

    this.piecesBySubcase = piecesBySubcase;
  });
}

function removeDuplicatePiece(submittedPieces) {
  const seen = new Set();
  const uniquePieces = [];
  for (const submittedPiece of submittedPieces) {
    const piece = submittedPiece.belongsTo('piece').value();
    if (!seen.has(piece.id)) {
      seen.add(piece.id);
      uniquePieces.push(submittedPiece);
    }
  }

  return uniquePieces;
}
