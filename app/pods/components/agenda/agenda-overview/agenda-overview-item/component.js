/* eslint-disable no-dupe-class-members */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';

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

  @alias('sessionService.currentAgenda') currentAgenda;

  @alias('sessionService.currentSession') currentSession;

  @alias('args.agendaitem.checkAdded') isNew;

  @alias('args.agendaitem.agendaActivity.subcase') subcase;

  @alias('args.agendaitem.treatments.firstObject.newsletterInfo') newsletterInfo;

  hideLabel = true;

  isShowingChanges = null;

  @tracked renderDetails = null;

  @tracked showLoader = false;

  @tracked retracted = this.args.agendaitem.retracted || false;

  @tracked aboutToDelete = this.args.agendaitem.aboutToDelete || null;

  @tracked formallyOk = this.args.agendaitem.formallyOk || null;

  get overheidCanViewDocuments() {
    const isOverheid = this.currentSessionService.isOverheid;
    const documentsAreReleased = this.currentSession.releasedDocuments;

    return !(isOverheid && !documentsAreReleased);
  }

  @action
  async startPublication() {
    this.showLoader = true;
    const _case = await this.subcase.get('case');
    const newPublicationNumber = await this.publicationService.getNewPublicationNextNumber();
    const newPublication = await this.publicationService.createNewPublication(newPublicationNumber, _case.id);
    this.showLoader = false;
    this.router.transitionTo('publications.publication.case', newPublication.id);
  }

  @action
  onEnter() {
    setTimeout(() => {
      this.renderDetails = true;
    }, 500);
  }

  @action
  onExit() {
    this.renderDetails = false;
  }

  get isActive() {
    if (!this.args.agendaitem.isDestroyed && this.selectedAgendaitem) {
      return this.args.agendaitem === this.selectedAgendaitem.id;
    }
    return null;
  }

  get classNameBindings() {
    return `
    ${this.isActive ? 'vlc-agenda-items__sub-item--active' : ''}
    ${this.isClickable ? '' : 'not-clickable'}
    ${this.retracted ? 'vlc-u-opacity-lighter' : ''}
    ${this.isNew ? 'vlc-agenda-items__sub-item--added-item' : ''}
    `;
  }

  @action
  async setAction(agendaitem) {
    const uri = agendaitem.get('uri');
    this.args.setFormallyOkAction(uri);
  }
}
