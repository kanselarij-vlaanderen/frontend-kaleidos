import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class CasesCaseRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return RSVP.hash({
      decisionmakingFlow: this.store.findRecord(
        'decisionmaking-flow',
        params.id
      ),
      latestParliamentSubmissionActivity: this.store.queryOne(
        'parliament-submission-activity',
        {
          'filter[parliament-subcase][parliament-flow][case][decisionmaking-flow][:id:]':
            params.id,
          sort: '-start-date',
        }
      ),
      parliamentFlow: this.store.queryOne('parliament-flow', {
        'filter[case][decisionmaking-flow][:id:]': params.id,
        include: 'status,parliament-subcase',
      }),
      subcases: this.store.queryAll('subcase', {
        'filter[decisionmaking-flow][:id:]': params.id,
        sort: 'created',
        include: 'type',
      }),
    });
  }

  async redirect(model, transition) {
    if (transition.to.name === 'cases.case.index') {
      if (
        model.latestParliamentSubmissionActivity.startDate >
        model.subcases.lastObject.created
      ) {
        debugger;
        this.router.transitionTo('cases.case.parliament-flow');
      } else {
        debugger;
        this.router.transitionTo('cases.case.subcases');
      }
    }
  }
}
