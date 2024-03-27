import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class CasesParliamentNewestDocumentsPanelComponent extends Component {
  @service store;

  @tracked piecesBySubcase;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    // Hier wil ik alle submittedPieces van een parliamentFlow opvragen
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
    });

    const groupBySubcase = submittedPieces.reduce(
      (acc, submittedPiece) => {
        const { subcaseName } = submittedPiece;
        acc[subcaseName] = acc[subcaseName] ?? [];
        acc[subcaseName].push(submittedPiece);
        return acc;
      },
      {}
    );

    this.piecesBySubcase = groupBySubcase;
  });
}
