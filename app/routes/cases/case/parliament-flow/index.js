import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class CasesCaseParliamentFlowIndex extends Route {
  @service store;

  model() {
    const {
      decisionmakingFlow,
      parliamentFlow,
      parliamentSubmissionActivities,
      latestParliamentSubmissionActivity,
      latestParliamentRetrievalActivity,
    } = this.modelFor('cases.case');
    return RSVP.hash({
      decisionmakingFlow,
      parliamentFlow,
      submissionActivities: parliamentSubmissionActivities,
      latestSubmissionActivity: latestParliamentSubmissionActivity,
      latestRetrievalActivity: latestParliamentRetrievalActivity,
    });
  }
}
