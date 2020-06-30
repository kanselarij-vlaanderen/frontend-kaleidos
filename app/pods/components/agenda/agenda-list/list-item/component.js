import Component from '@glimmer/component';
import { action} from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import {tracked} from "@glimmer/tracking";

export default class ListItem extends Component {
  // INFO Get from parent
  // @agendaitem={{agendaitem}}
  // @isEditingOverview={{isEditingOverview}}
  // @selectAgendaItem={{action "selectAgendaItemAction"}}

  @service store;
  @service sessionService;
  @service('current-session') currentSessionService;
  @service agendaService;
  @service toaster;

  @alias('sessionService.selectedAgendaItem') selectedAgendaItem;
  @alias('sessionService.currentAgenda') currentAgenda;
  @alias('args.agendaitem.checkAdded') isNew;


  isClickable = true;
  hideLabel = true;
  isShowingChanges = null;

  @tracked renderDetails = null;
  @tracked retracted = this.args.agendaitem.get('retracted');
  @tracked isPostponed = this.args.agendaitem.postponedTo.get('postponed');
  @tracked aboutToDelete = this.args.agendaitem.aboutToDelete || null;
  @tracked formallyOk = this.args.agendaitem.formallyOk || null;

  get classNameBinding(){
    return`
    ${this.isActive ? 'vlc-agenda-items__sub-item--active' : ''}
    ${this.isClickable ? '' : 'not-clickable'}
    ${this.retracted||this.isPostponed ? 'vlc-u-opacity-lighter' : ''}
    ${this.isNew ? 'vlc-agenda-items__sub-item--added-item': ''}
    `
  }

  get isActive(){
    if (!this.args.agendaitem.isDestroyed && this.selectedAgendaItem) {
      return this.args.agendaitem === this.selectedAgendaItem.id;
    }
    return null;
  }

  @action
  onEnter(){
    setTimeout(() => {
      this.renderDetails = true;
    }, 1000)
  }

  @action
  onExit(){
    this.renderDetails = false;
  }

  @action
  async setAction(item) {
    // this.set('isLoading', true);
    const uri = item.get('uri');
    this.args.agendaitem.formallyOk = uri;
    await this.args.agendaitem
      .save()
      .catch(() => {
        this.toaster.error();
      });
  }

  @action
  async openAgendaItem() {
    if (!this.isEditingOverview && !this.isComparing) {
      const agendaitem = await this.store.findRecord('agendaitem', this.args.agendaitem.id);
      this.args.selectAgendaItem(agendaitem);
    }
  }
}
