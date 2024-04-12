import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SubcasesSideNavComponent extends Component {
  @tracked items;

  constructor() {
    super(...arguments);
    this.loadItems();
  }

  loadItems() {
    let items = [];

    if (this.args.subcases) {
      items = items.concat(
        this.args.subcases.map((subcase, index) => ({
          subcase,
          sortDate: subcase.created,
          number: index, // subcases is already sorted
          type: 'regular',
        }))
      );
    }

    const submissionActivity = this.args.latestParliamentSubmissionActivity;
    const retrievalActivity = this.args.latestParliamentRetrievalActivity;
    if (this.args.parliamentFlow) {
      items.push({
        parliamentFlow: this.args.parliamentFlow,
        latestSubmissionActivity: submissionActivity,
        latestRetrievalActivity: retrievalActivity,
        sortDate: retrievalActivity?.startDate ?? submissionActivity?.startDate,
        type: 'parliament',
      });
    }

    this.items = items.sort((item1, item2) =>
      item2.sortDate?.valueOf() - item1.sortDate?.valueOf()
    );
  }
}