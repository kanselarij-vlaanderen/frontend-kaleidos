import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CasesCaseIndexRoute extends Route {
  @service router;

  async redirect(model, transition) {
    debugger
    if (transition.to.name === 'cases.case.index') {
      if (
        model.parliamentFlow &&
        (model.latestParliamentRetrievalActivity?.startDate >
          model.subcases?.lastObject.created ||
          model.latestParliamentSubmissionActivity?.startDate >
            model.subcases?.lastObject.created)
      ) {
        this.router.transitionTo('cases.case.parliament-flow');
      } else {
        this.router.transitionTo('cases.case.subcases');
      }
    }
  }
}
