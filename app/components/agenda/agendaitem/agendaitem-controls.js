import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AgendaitemControls extends Component {
  @service store;
  @service intl;
  @service sessionService;
  @service agendaService;
  @service currentSession;

  @tracked isSavingRetracted = false;
  @tracked isVerifying = false;
  @tracked showLoader = false;

  // eslint-disable-next-line ember/use-brace-expansion
  get isPostPonable() {
    const agendaActivity = this.args.agendaitem.get('agendaActivity');
    if (!agendaActivity) {
      // In case of legacy agendaitems without a link to subcase (old) or agenda-activity
      // Or in case of the agendaitem to approve minutes ("verslag vorige vergadering")
      return false;
    }
    return this.sessionService.get('agendas')
      .then((agendas) => !!(agendas && agendas.get('length') > 1));
  }

  // TODO document this
  get isDeletable() {
    const designAgenda =  this.args.currentAgenda.get('isDesignAgenda');
    const agendaActivity =  this.args.agendaitem.get('agendaActivity');
    if (!designAgenda) {
      return false;
    }
    if (agendaActivity) {
      const agendaitems = agendaActivity.get('agendaitems');
      return !(agendaitems && agendaitems.length > 1);
    }
    return true;
  }

  get deleteWarningText() {
    if (this.isDeletable) {
      return this.intl.t('delete-agendaitem-message');
    } if (this.currentSession.isAdmin) {
      return this.intl.t('delete-agendaitem-from-meeting-message');
    }
    return null;
  }

  async deleteItem(agendaitem) {
    this.isVerifying = false;
    this.showLoader = true;
    if (await this.isDeletable) {
      await this.agendaService.deleteAgendaitem(agendaitem);
    } else {
      await this.agendaService.deleteAgendaitemFromMeeting(agendaitem);
    }

    if (this.args.onDeleteAgendaitem) {
      await this.args.onDeleteAgendaitem();
    }
    this.showLoader = false;
  }

  @action
  async postponeAgendaitem(agendaitem) {
    this.isSavingRetracted = true;
    agendaitem.set('retracted', true);
    await agendaitem.save();
    this.isSavingRetracted = false;
  }

  @action
  async advanceAgendaitem(agendaitem) {
    this.isSavingRetracted = true;
    agendaitem.set('retracted', false);
    await agendaitem.save();
    this.isSavingRetracted = false;
  }

  @action
  toggleIsVerifying() {
    this.isVerifying = !this.isVerifying;
  }

  @action
  verifyDelete(agendaitem) {
    this.deleteItem(agendaitem);
  }
}
