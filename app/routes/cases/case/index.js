import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CasesCaseIndexRoute extends Route {
  @service router;

  async redirect(model, transition) {
    const latestSubcase = model.subcases?.at(-1);
    const parlRetrievalIsNewer =
      model.latestParliamentRetrievalActivity?.startDate >
      latestSubcase?.created;
    const parlSubmissionIsNewer =
      model.latestParliamentSubmissionActivity?.startDate >
      latestSubcase?.created;
    if (transition.to.name === 'cases.case.index') {
      if (
        model.parliamentFlow &&
        (parlRetrievalIsNewer || parlSubmissionIsNewer)
      ) {
        this.router.transitionTo('cases.case.parliament-flow');
      } else if (model.publicationFlows.length) {
        this.router.transitionTo(
          'cases.case.publication-flow',
          model.publicationFlows[0].id
        );
      } else {
        this.router.transitionTo('cases.case.subcases');
      }
    }
  }
}
