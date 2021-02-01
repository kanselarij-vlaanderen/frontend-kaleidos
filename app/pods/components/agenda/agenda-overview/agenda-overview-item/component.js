import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class AgendaOverviewItem extends Component {
  /**
   *
   * @argument agendaitem
   * @argument isEditingOverview
   */

  @service store;
  @service sessionService;
  @service publicationService;
  @service router;

  @service('current-session') currentSessionService;

  @tracked subcase;
  @tracked newsletterIsVisible;

  constructor() {
    super(...arguments);
    this.loadSubcase.perform();
    this.loadNewsletterVisibility.perform();
  }

  get documentsAreReleased() {
    return this.sessionService.currentSession.releasedDocuments > new Date();
  }

  @task
  *startPublication() {
    const _case = yield this.args.agendaitem.get('case');
    const newPublication = yield this.publicationService.createNewPublication(0, _case.id);
    this.router.transitionTo('publications.publication.case', newPublication.id);
  }

  @task
  *setFormallyOkStatus(status) {
    yield this.args.setFormallyOkAction(status.uri);
  }

  @task
  *loadSubcase() {
    const agendaActivity = yield this.args.agendaitem.agendaActivity;
    if (agendaActivity) { // the approval agenda-item doesn't have agenda activity
      this.subcase = yield agendaActivity.subcase;
    }
  }

  @task
  *loadNewsletterVisibility() {
    const treatments = yield this.args.agendaitem.treatments;
    const treatment = treatments.firstObject;
    if (treatment) { // TODO: this is only the case for the first item of the agenda (approval, older data)
      const newsletterInfo = yield treatment.newsletterInfo;
      if (newsletterInfo) {
        this.newsletterIsVisible = newsletterInfo.inNewsletter;
      } else {
        this.newsletterIsVisible = false;
      }
    } else {
      this.newsletterIsVisible = false;
    }
  }
}
