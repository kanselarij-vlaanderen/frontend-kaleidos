import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CasesCaseIndexRoute extends Route {
  @service router;

  async redirect(model, transition) {
    if (transition.to.name === 'cases.case.index') {
      if (
        model.parliamentFlow &&
        (model.latestParliamentRetrievalActivity?.startDate >
          model.subcases?.at(-1).created ||
          model.latestParliamentSubmissionActivity?.startDate >
            model.subcases?.at(-1).created)
      ) {
        this.router.transitionTo('cases.case.parliament-flow');
      } else {
        this.router.transitionTo('cases.case.subcases');
      }
    }
  }
}
