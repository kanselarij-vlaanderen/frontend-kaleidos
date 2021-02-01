/* eslint-disable no-dupe-class-members */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class AgendaOverviewItem extends Component {
  /**
   * INFO arguments from parent.
   *
   * @agendaitem={{agendaitem}}
   * @isEditingOverview={{isEditingOverview}}
   */

  @service store;
  @service sessionService;
  @service publicationService;
  @service router;

  @service('current-session') currentSessionService;
  @alias('sessionService.currentSession') currentSession;

  hideLabel = true;

  isShowingChanges = null;

  @tracked subcase;
  @tracked newsletterIsVisible;

  @tracked showLoader = false;

  @tracked retracted = this.args.agendaitem.retracted || false;
  @tracked aboutToDelete = this.args.agendaitem.aboutToDelete || null;
  @tracked formallyOk = this.args.agendaitem.formallyOk || null;

  constructor() {
    super(...arguments);
    this.loadSubcase.perform();
    this.loadNewsletterVisibility.perform();
  }

  get classNameBindings() {
    return `
    ${this.retracted ? 'vlc-u-opacity-lighter' : ''}
    `;
  }

  get overheidCanViewDocuments() {
    const isOverheid = this.currentSessionService.isOverheid;
    const documentsAreReleased = this.currentSession.releasedDocuments;

    return !(isOverheid && !documentsAreReleased);
  }

  @action
  async startPublication() {
    this.showLoader = true;
    const _case = await this.args.agendaitem.get('case');
    const newPublication = await this.publicationService.createNewPublication(0, _case.id);
    this.showLoader = false;
    this.router.transitionTo('publications.publication.case', newPublication.id);
  }

  @action
  async setAction(agendaitem) {
    const uri = agendaitem.get('uri');
    this.args.setFormallyOkAction(uri);
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
