import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CasesSubmissionsIndexRoute extends Route {
  @service currentSession;
  @service router;

  async model(params) {
    if (!params.submission_id || !this.currentSession.may('view-submissions')) {
      this.router.transitionTo('submissions');
    }
  }
}
