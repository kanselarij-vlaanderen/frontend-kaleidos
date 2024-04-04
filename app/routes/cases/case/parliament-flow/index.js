import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class CasesCaseParliamentFlowIndex extends Route {
  @service store;

  model() {
    const {
      decisionmakingFlow,
      parliamentFlow,
      latestParliamentSubmissionActivity,
      latestParliamentRetrievalActivity,
    } = this.modelFor('cases.case');
    return RSVP.hash({
      decisionmakingFlow,
      parliamentFlow,
      latestSubmissionActivity: latestParliamentSubmissionActivity,
      latestRetrievalActivity: latestParliamentRetrievalActivity,
      subcase: this.store.queryOne('parliament-subcase', {
        'filter[parliament-flow][:id:]': parliamentFlow.id,
      }),
      submissionActivities: this.store.queryAll(
        'parliament-submission-activity',
        {
          'filter[parliament-subcase][parliament-flow][:id:]':
            parliamentFlow.id,
        }
      ),
    });
  }
}
