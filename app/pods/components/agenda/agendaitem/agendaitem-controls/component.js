import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';


export default class AgendaItemControls extends Component {
  @service store;
  @service intl;
  @service sessionService;
  @service agendaService;
  @service currentSession;

  @tracked isSavingRetracted = false;
  @tracked isVerifying = false;
  @tracked showOptions = false;

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

  // TODO verbose logic
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
    if (await this.get('isDeletable')) {
      await this.agendaService.deleteAgendaitem(agendaitem);
    } else {
      await this.agendaService.deleteAgendaitemFromMeeting(agendaitem);
    }
    this.set('sessionService.selectedAgendaitem', null);
    if (this.onDeleteAgendaitem) {
      this.onDeleteAgendaitem(agendaitem);
    }
  }


  @action
  showOptions() {
    this.showOptions = !this.showOptions;
  }

  @action
  async postponeAgendaitem(agendaitem) {
    this.isSavingRetracted = true;
    agendaitem.set('retracted', true);
    // TODO KAS-1420 change property on treatment during model rework
    // TODO KAS-1420 create treatment ?
    await agendaitem.save();
    this.isSavingRetracted = false;
  }

  @action
  async advanceAgendaitem(agendaitem) {
    this.isSavingRetracted = true;
    // TODO KAS-1420 change property on treatment during model rework
    // TODO KAS-1420 delete postponed treatment ?
    // what to do when deleting treatment ?
    agendaitem.set('retracted', false);
    await agendaitem.save();
    this.isSavingRetracted = false;
  }

  @action
  toggleIsVerifying() {
    this.isVerifying = !this.isVerifying;
  }

  @action
  async tryToDeleteItem(agendaitem) {
    if (await this.isDeletable) {
      this.deleteItem(agendaitem);
    } else if (this.currentSession.isAdmin) {
      this.isVerifying = true;
    }
  }

  @action
  verifyDelete(agendaitem) {
    this.deleteItem(agendaitem);
  }
}
