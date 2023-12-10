import Component from '@glimmer/component';
import { trackedFunction } from 'ember-resources/util/function';
import { inject as service } from '@ember/service';

export default class SentToVpModalComponent extends Component {
  @service store;

  subcaseWithPieces = trackedFunction(this, async() => {
    const parliamentarySubmissionActivity = await this.args.submissionActivity;

    const submittedPieces = await parliamentarySubmissionActivity.submittedPieces;

    const subcases = new Set();
    const piecesForSubcase = new Map();

    for (const submittedPiece of submittedPieces) {
      const piece = await submittedPiece.piece;

      let subcase;
      const _submissionActivity = await piece.submissionActivity;
      if (_submissionActivity) {
        subcase = await _submissionActivity.subcase;
      } else {
        // Might be a report, get the subcase via the decision activity
        const decisionActivity = await piece.decisionActivity;
        subcase = await decisionActivity.subcase;
      }

      if (!subcase) {
        // Normally all pieces should have a link to a subcase, but just in case
        continue;
      }
      subcases.add(subcase);

      const _pieces = piecesForSubcase.get(subcase.id);
      if (_pieces) {
        _pieces.push({ piece, submittedPiece });
      } else {
        piecesForSubcase.set(subcase.id, [{ piece, submittedPiece }]);
      }
    }

    return Array.from(subcases)
                .sort((s1, s2) => s2.date - s1.date)
                .map((subcase) => ({
      subcase,
      pieces: piecesForSubcase
        .get(subcase.id)
        .sort((o1, o2) => {
          const { piece: piece1 } = o1;
          const { piece: piece2 } = o2;
          return piece1.name.localeCompare(piece2.name);
        }),
    }));
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
      list.push('ondertekend');
    }

    if (list.length) {
      return `(${formatter.format(list)})`;
    }
    return '';
  }
}
