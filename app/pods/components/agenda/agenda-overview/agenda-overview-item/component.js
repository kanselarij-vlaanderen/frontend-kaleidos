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
   * @selectAgendaItem={{action "selectAgendaItemAction"}}
   */

  @service sessionService;

  @service('current-session') currentSessionService;

  @alias('sessionService.currentAgenda') currentAgenda;

  @alias('sessionService.currentSession') currentSession;

  @alias('args.agendaitem.checkAdded') isNew;

  @alias('args.agendaitem.agendaActivity.subcase') subcase;

  hideLabel = true;

  isShowingChanges = null;

  @tracked renderDetails = null;

  @tracked retracted = this.args.agendaitem.retracted || false;

  @tracked aboutToDelete = this.args.agendaitem.aboutToDelete || null;

  @tracked formallyOk = this.args.agendaitem.formallyOk || null;

  get classNameBindings() {
    return `
    ${this.retracted ? 'vlc-u-opacity-lighter' : ''}
    ${this.isNew ? 'vlc-agenda-items__sub-item--added-item' : ''}
    `;
  }

  get overheidCanViewDocuments() {
    const isOverheid = this.currentSessionService.isOverheid;
    const documentsAreReleased = this.currentSession.releasedDocuments;

    return !(isOverheid && !documentsAreReleased);
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
    ${this.retracted || this.isPostponed ? 'vlc-u-opacity-lighter' : ''}
    ${this.isNew ? 'vlc-agenda-items__sub-item--added-item' : ''}
    `;
  }

  @action
  async setAction(item) {
    const uri = item.get('uri');
    this.args.setFormallyOkAction(uri);
  }

  @action
  async openAgendaItem() {
    if (!this.isEditingOverview && !this.isComparing) {
      this.args.selectAgendaItem(this.args.agendaitem);
    }
  }
}
