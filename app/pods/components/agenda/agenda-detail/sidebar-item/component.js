import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import {tracked} from "@glimmer/tracking";

export default class SidebarItem extends Component{
  @service store;
  @service sessionService;
  @service('current-session') currentSessionService;
  @service agendaService;
  @service toaster;
  @alias('sessionService.selectedAgendaItem') selectedAgendaItem;
  @alias('sessionService.currentAgenda') currentAgenda;
  @alias('args.agendaitem.checkAdded') isNew;

  hideLabel = true;
  isShowingChanges = null;
  renderDetails= false;

  @tracked isClickable = true;
  @tracked isPostponed = this.args.agendaitem.postponedTo.get('postponed');
  @tracked isRetracted = this.args.agendaitem.retracted;

  get classNameBindings() {
    return`
      ${this.isActive ? 'vlc-agenda-detail-sidebar__sub-item--active' : ''}
      ${this.isClickable ? '' : 'not-clickable'}
      ${this.isPostponed || this.isRetracted ? 'vlc-u-opacity-lighter' : ''}
      ${this.isNew ? 'vlc-agenda-items__sub-item--added-item' : ''}
    `;
  }

  //Todo this might not be needed anymore
  // init() {
  //   this._super(...arguments);
  //   observer(
  //     'agendaitem.postponedTo',
  //     async function () {
  //       const postponed = await this.get('agendaitem.postponedTo');
  //       if (!this.get('isDestroyed')) {
  //         this.set('isPostponed', !!postponed);
  //       }
  //     }
  //   );
  // },


  get isActive() {
    if (!this.args.agendaitem.isDestroyed && this.selectedAgendaItem) {
      return this.args.agendaitem.id === this.selectedAgendaItem.id;
    }
    return null;
  }

  @action
  async openDetailPage() {
    if (!this.isEditingOverview && !this.isComparing) {
      const agendaitem = await this.store.findRecord('agendaitem', this.args.agendaitem.id);
      this.args.selectAgendaItem(agendaitem);
    }
  }
}
