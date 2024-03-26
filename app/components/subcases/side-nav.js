import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SubcasesSideNavComponent extends Component {
  @service store;

  @tracked parliamentSubcaseWithActivity;
  @tracked subcases = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    const [subcases, parliamentSubcaseWithActivity] = await Promise.all([
      this.loadSubcases.perform(),
      this.loadParliamentSubcase.perform(),
    ]);

    this.subcases = subcases;
    this.parliamentSubcaseWithActivity = parliamentSubcaseWithActivity;
  });

  loadSubcases = task(async () => {
    const queryParams = {
      'filter[decisionmaking-flow][:id:]': this.args.decisionmakingFlow.id,
      sort: 'created',
      include: 'type',
    };

    return await this.store.queryAll('subcase', queryParams);
  });

  loadParliamentSubcase = task(async () => {
    const subcase = await this.store.queryOne('parliament-subcase', {
      'filter[parliament-flow][case][decisionmaking-flow][:id:]':
        this.args.decisionmakingFlow.id,
      include: 'parliament-flow.status',
    });

    const latestActivity = await this.store.queryOne(
      'parliament-submission-activity',
      {
        'filter[parliament-subcase][:id:]': subcase.id,
        sort: '-start-date',
      }
    );

    return {
      subcase,
      parliamentFlow: subcase.parliamentFlow,
      latestSubmissionActivity: latestActivity,
    };
  });

  get items() {
    let items = [];

    if (this.subcases) {
      items = items.concat(
        this.subcases.map((subcase, index) => ({
          subcase,
          number: index,
          type: 'regular',
        }))
      );
    }

    if (this.parliamentSubcaseWithActivity) {
      const { latestSubmissionActivity } = this.parliamentSubcaseWithActivity;
      const insertItem = {
        ...this.parliamentSubcaseWithActivity,
        type: 'parliament',
      };
      const insertPos = items.findIndex(
        (item) => item.subcase.created > latestSubmissionActivity.startDate
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
