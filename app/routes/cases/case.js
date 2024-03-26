import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class CasesCaseRoute extends Route {
  @service store;

  model(params) {
    return RSVP.hash({
      decisionmakingFlow: this.store.findRecord(
        'decisionmaking-flow',
        params.id,
        {
          reload: true,
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
}
