import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { sortPieces } from 'fe-redpencil/utils/documents';

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

  @tracked agendaitemDocuments
  @tracked subcase;
  @tracked newsletterIsVisible;

  @tracked isShowingAllDocuments = false;

  constructor() {
    super(...arguments);
    this.agendaitemDocuments = [];
    this.loadDocuments.perform();
    this.loadSubcase.perform();
    this.loadNewsletterVisibility.perform();
  }

  get documentsAreReleased() {
    return this.sessionService.currentSession.releasedDocuments > new Date();
  }

  get documentListSize() {
    return 20;
  }

  get limitedAgendaitemDocuments() {
    if (this.isShowingAllDocuments) {
      return this.agendaitemDocuments;
    }
    return this.agendaitemDocuments.slice(0, this.documentListSize);
  }

  get enableShowMore() {
    return this.agendaitemDocuments.length > this.documentListSize;
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
  *loadDocuments() {
    let pieces = yield this.args.agendaitem.pieces;
    pieces = pieces.toArray();
    const sortedPieces = sortPieces(pieces);
    this.agendaitemDocuments = sortedPieces;
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

  @action
  toggleShowingAllDocuments() {
    this.isShowingAllDocuments = !this.isShowingAllDocuments;
  }
}
