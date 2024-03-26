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
          number: index,
          type: 'regular',
        }))
      );
    }

    const activity = this.args.latestParliamentSubmissionActivity;
    if (activity) {
      const insertItem = {
        parliamentFlow: this.args.parliamentFlow,
        latestSubmissionActivity: activity,
        type: 'parliament',
      };
      const insertPos = items.findIndex(
        (item) => item.subcase.created > activity.startDate
      );
      if (insertPos !== -1) {
        items.splice(insertPos, 0, insertItem);
      } else {
        items.push(insertItem); // Add to the end if not found in between
      }
    }

    return items.reverse();
  }
}
