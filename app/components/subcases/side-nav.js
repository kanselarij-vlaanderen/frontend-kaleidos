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
    this.loadParliamentSubcase.perform();
    this.loadSubcases.perform();
  }

  loadSubcases = task(async () => {
    const queryParams = {
      'filter[decisionmaking-flow][:id:]': this.args.decisionmakingFlow.id,
      sort: 'created',
      include: 'type',
    };

    this.subcases = await this.store.queryAll('subcase', queryParams);
  });

  loadParliamentSubcase = task(async () => {
    const subcase = await this.store.queryOne('parliament-subcase', {
      'filter[parliament-flow][case][decisionmaking-flow][:id:]':
        this.args.decisionmakingFlow.id,
    });

    const latestActivity = await this.store.queryOne('parliament-submission-activity', {
      'filter[parliament-subcase][:id:]': subcase.id,
      sort: '-start-date'
    });
    
    this.parliamentSubcaseWithActivity = {
      subcase ,
      activity: latestActivity,
    }
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
      const { subcase, activity } = this.parliamentSubcaseWithActivity;
      const insertItem = {
        subcase,
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
