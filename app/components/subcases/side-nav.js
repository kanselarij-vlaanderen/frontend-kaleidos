import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SubcasesSideNavComponent extends Component {
  @service store;

  get items() {
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

    const activity = this.args.latestParliamentSubmissionActivity;
    if (activity) {
      items.push({
        parliamentFlow: this.args.parliamentFlow,
        latestSubmissionActivity: activity,
        sortDate: activity.startDate,
        type: 'parliament',
      });
    }

    return items.sort((item1, item2) => item1.sortDate < item2.sortDate);
  }
}
