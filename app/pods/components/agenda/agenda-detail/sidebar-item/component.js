import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';

export default class SidebarItem extends Component {
  /**
   * INFO arguments from parent.
   * @agendaitem={{agendaitem}}
   * @selectAgendaitem={{action "selectAgendaitemAction"}}
   */

  @service store;
  @service sessionService;
  @service('current-session') currentSessionService;
  @service agendaService;
  @service toaster;
  @service router;

  @alias('sessionService.selectedAgendaitem') selectedAgendaitem;
  @alias('sessionService.currentAgenda') currentAgenda;
  @alias('args.agendaitem.agendaActivity.subcase') subcase;
  @alias('args.agendaitem.treatments.firstObject.newsletterInfo') newsletterInfo;

  @alias('args.agendaitem.retracted') isRetracted;

  @tracked renderDetails = null;

  get class() {
    const classes = [];
    if (this.isActive) {
      classes.push('vlc-agenda-detail-sidebar__sub-item--active');
    }
    if (this.isRetracted) {
      classes.push('vlc-u-opacity-lighter');
    }
    return classes.join(' ');
  }

  get isActive() {
    if (!this.args.agendaitem.isDestroyed && this.selectedAgendaitem) {
      return this.args.agendaitem.id === this.selectedAgendaitem.id;
    }
    return null;
  }

  @action
  onEnter() {
    setTimeout(() => {
      this.renderDetails = true;
    }, 100);
  }

  @action
  onExit() {
    this.renderDetails = false;
  }

  @action
  async openDetailPage() {
    if (!this.isEditingOverview && !this.isComparing) {
      const agendaitem = await this.store.findRecord('agendaitem', this.args.agendaitem.id);
      this.args.selectAgendaitem(agendaitem);
    }
  }

  @action
  conditionallyScrollIntoView(element) {
    if (this.isActive) {
      element.scrollIntoView({
        behavior: 'smooth', block: 'center',
      });
    }
  }
}
