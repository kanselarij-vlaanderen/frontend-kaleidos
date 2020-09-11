import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  intl: service(),
  sessionService: service(),
  agendaService: service(),
  currentSession: service(),
  currentAgenda: null,
  agendaitem: null,
  isSavingRetracted: null,

  // eslint-disable-next-line ember/use-brace-expansion
  isPostPonable: computed('sessionService.agendas.@each', 'agendaitem.agendaActivity', 'agendaitem.retracted', async function() {
    const agendaActivity = await this.get('agendaitem.agendaActivity');
    if (!agendaActivity) {
      // In case of legacy agendaitems without a link to subcase (old) or agenda-activity
      // Or in case of the agendaitem to approve minutes ("verslag vorige vergadering")
      return false;
    }
    return this.get('sessionService.agendas').then((agendas) => !!(agendas && agendas.get('length') > 1));
  }),

  // TODO verbose logic
  isDeletable: computed(
    'agendaitem.agendaActivity', 'currentAgenda.name', async function() {
      const designAgenda = await this.get('currentAgenda.isDesignAgenda');
      const agendaActivity = await this.get('agendaitem.agendaActivity');
      if (!designAgenda) {
        return false;
      }
      if (agendaActivity) {
        const agendaitems = await agendaActivity.get('agendaitems');
        return !(agendaitems && agendaitems.length > 1);
      }
      return true;
    }
  ),

  async deleteItem(agendaitem) {
    this.toggleProperty('isVerifying');
    if (await this.get('isDeletable')) {
      await this.agendaService.deleteAgendaitem(agendaitem);
    } else {
      await this.agendaService.deleteAgendaitemFromMeeting(agendaitem);
    }
    this.set('sessionService.selectedAgendaitem', null);
    if (this.onDeleteAgendaitem) {
      this.onDeleteAgendaitem(agendaitem);
    }
  },

  deleteWarningText: computed('agendaitem.agendaActivity', async function() {
    if (await this.isDeletable) {
      return this.intl.t('delete-agendaitem-message');
    } if (this.currentSession.isAdmin) {
      return this.intl.t('delete-agendaitem-from-meeting-message');
    }
    return null;
  }),

  actions: {
    showOptions() {
      this.toggleProperty('showOptions');
    },

    async postponeAgendaitem(agendaitem) {
      this.set('isSavingRetracted', true);
      agendaitem.set('retracted', true);
      // TODO KAS-1420 change property on treatment during model rework
      // TODO KAS-1420 create treatment ?
      await agendaitem.save();
      this.set('isSavingRetracted', false);
    },

    async advanceAgendaitem(agendaitem) {
      this.set('isSavingRetracted', true);
      // TODO KAS-1420 change property on treatment during model rework
      // TODO KAS-1420 delete postponed treatment ?
      // what to do when deleting treatment ?
      agendaitem.set('retracted', false);
      await agendaitem.save();
      this.set('isSavingRetracted', false);
    },

    toggleIsVerifying() {
      this.toggleProperty('isVerifying');
    },

    async tryToDeleteItem(agendaitem) {
      if (await this.isDeletable) {
        this.deleteItem(agendaitem);
      } else if (this.currentSession.isAdmin) {
        this.toggleProperty('isVerifying');
      }
    },

    verifyDelete(agendaitem) {
      this.deleteItem(agendaitem);
    },
  },
});
