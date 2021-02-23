import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';
import {
  dropTask,
  task
} from 'ember-concurrency-decorators';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

export default class AgendaOverviewItem extends Component {
  /**
   *
   * @argument agendaitem
   * @argument currentAgenda: both agenda's for determining changed documents
   * @argument previousAgenda
   * @argument isEditingFormallyOkStatus
   */

  @service store;
  @service toaster;
  @service sessionService;
  @service agendaService;
  @service publicationService;
  @service router;
  @service('current-session') currentSessionService;

  @tracked agendaitemDocuments;
  @tracked newAgendaitemDocuments;
  @tracked subcase;
  @tracked newsletterIsVisible;

  @tracked isShowingAllDocuments = false;

  constructor() {
    super(...arguments);
    this.agendaitemDocuments = [];
    this.newAgendaitemDocuments = [];
    this.loadDocuments.perform();
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

  @action
  async startPublication() {
    this.showLoader = true;
    const _case = await this.args.agendaitem.get('case');
    const newPublicationNumber = await this.publicationService.getNewPublicationNextNumber();
    const newPublication = await this.publicationService.createNewPublication(newPublicationNumber, _case.id);
    this.showLoader = false;
    this.router.transitionTo('publications.publication.case', newPublication.id);
  }

  @task
  *setFormallyOkStatus(status) {
    yield this.args.setFormallyOkAction(status.uri);
  }

  @task
  *loadDocuments() {
    let pieces = yield this.args.agendaitem.pieces;
    pieces = pieces.toArray();
    const sortedPieces = sortPieces(pieces);
    this.agendaitemDocuments = sortedPieces;
  }

  @dropTask
  *lazyLoadSideData() {
    yield timeout(400);
    const tasks = [
      this.loadNewDocuments,
      this.loadSubcase,
      this.loadNewsletterVisibility
    ].filter((task) => task.performCount === 0);
    yield Promise.all(tasks.map((task) => task.perform()));
  }

  @action
  cancelLazyLoad() {
    this.lazyLoadSideData.cancelAll();
  }

  @task
  *loadNewDocuments() { // Documents to be highlighted
    if (this.args.previousAgenda) { // Highlighting everything on the first agenda-version as "new" doesn't add a lot of value.
      this.newAgendaitemDocuments = yield this.agendaService.changedPieces(this.args.currentAgenda.id,
        this.args.previousAgenda.id, this.args.agendaitem.id);
    }
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

  @action
  toggleShowingAllDocuments() {
    this.isShowingAllDocuments = !this.isShowingAllDocuments;
  }

  @action
  async setAndSaveFormallyOkStatus(newFormallyOkUri) {
    this.args.agendaitem.formallyOk = newFormallyOkUri;
    await this.args.agendaitem
      .save()
      .catch(() => {
        this.args.agendaitem.rollbackAttributes();
        this.toaster.error();
      });
  }
}
