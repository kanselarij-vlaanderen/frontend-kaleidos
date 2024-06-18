import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesSubmissionsSubmissionRoute extends Route {
  @service store;

  async model(params) {
    const submission = await this.store.findRecord(
      'submission',
      params.submission_id,
    );
    const mandatees = await submission.mandatees;
    this.mandatees = mandatees
        .slice()
        .sort((m1, m2) => m1.priority - m2.priority);

    return submission;
  }

  setupController(controller, _model, _transition) {
    controller.mandatees = this.mandatees;
  }
}
