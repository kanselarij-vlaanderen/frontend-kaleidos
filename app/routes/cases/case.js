import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CasesCaseRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    const [decisionmakingFlow, parliamentFlow, subcases] = await Promise.all([
      this.store.findRecord('decisionmaking-flow', params.id),
      this.store.queryOne('parliament-flow', {
        'filter[case][decisionmaking-flow][:id:]': params.id,
        include: 'parliament-subcase',
      }),
      this.store.queryAll('subcase', {
        'filter[decisionmaking-flow][:id:]': params.id,
        sort: 'created',
        include: 'type',
      }),
    ]);

    let parliamentSubmissionActivities;
    let latestParliamentSubmissionActivity;
    let latestParliamentRetrievalActivity;

    if (parliamentFlow) {
      [parliamentSubmissionActivities, latestParliamentRetrievalActivity] =
        await Promise.all([
          this.store.queryAll('parliament-submission-activity', {
            'filter[parliament-subcase][parliament-flow][:id:]':
              parliamentFlow.id,
            sort: '-start-date',
          }),
          this.store.queryOne('parliament-retrieval-activity', {
            'filter[parliament-subcase][parliament-flow][:id:]':
              parliamentFlow.id,
            sort: '-start-date',
          }),
        ]);
      parliamentSubmissionActivities = parliamentSubmissionActivities?.slice();
      latestParliamentSubmissionActivity = parliamentSubmissionActivities?.at(0);
    }

    return {
      decisionmakingFlow,
      parliamentSubmissionActivities,
      latestParliamentSubmissionActivity,
      latestParliamentRetrievalActivity,
      parliamentFlow,
      subcases: subcases?.slice(),
    };
  }
}
