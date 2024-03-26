import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SubcasesSideNavComponent extends Component {
  @service store;

  @tracked latestActivity;

  constructor() {
    super(...arguments);
    this.loadLatestSubmissionActivity.perform();
  }

  loadLatestSubmissionActivity = task(async () => {
    const latestActivity = await this.store.queryOne(
      'parliament-submission-activity',
      {
        'filter[parliament-subcase][parliament-flow][:id:]':
          this.args.parliamentFlow.id,
        sort: '-start-date',
      }
    );

    this.latestActivity = latestActivity;
  });

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

    if (this.latestActivity) {
      const insertItem = {
        parliamentFlow: this.args.parliamentFlow,
        latestSubmissionActivity: this.latestActivity,
        type: 'parliament',
      };
      const insertPos = items.findIndex(
        (item) => item.subcase.created > this.latestActivity.startDate
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
