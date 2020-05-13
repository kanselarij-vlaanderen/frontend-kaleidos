import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';

export default Component.extend({
  store: service(),
  intl: service(),
  sessionService: service(),
  agendaService: service(),
  currentSession: service(),
  currentAgenda: null,
  agendaitem: null,
  lastDefiniteAgenda: null,

  isPostPonable: computed("sessionService.agendas.@each", "agendaitem.subcase", async function () {
    const subcase = await this.agendaitem.get('subcase');
    if (!subcase) {
      return;
    }

    return this.get('sessionService.agendas').then(agendas => {
      return !!(agendas && agendas.get('length') > 1);
    });
  }),

  isDeletable: computed(
    'agendaitem.{subcase,subcase.agendaitems}', 'currentAgenda.name', async function () {
      const currentAgendaName = await this.get('currentAgenda.name');
      const agendaitemSubcase = await this.get('agendaitem.subcase');
      const agendaitems = await this.get('agendaitem.subcase.agendaitems');
      if (currentAgendaName && currentAgendaName !== 'Ontwerpagenda') {
        return false;
      } else if (agendaitemSubcase) {
        return !(agendaitems && agendaitems.length > 1);
      } else {
        return true;
      }
    }
  ),

  async deleteItem(agendaitem) {
    this.toggleProperty('isVerifying');
    const id = await agendaitem.get('id');
    const subcase = await agendaitem.get('subcase');
    if (subcase) {
      // Refresh the agendaitems for isDeletable
      await subcase.hasMany('agendaitems').reload();
    }
    if (await this.get('isDeletable')) {
      await this.agendaService.deleteAgendaitem(agendaitem);
    } else {
      await this.agendaService.deleteAgendaitemFromMeeting(agendaitem);
    }
    this.set('sessionService.selectedAgendaItem', null);
    this.refreshRoute(id);
  },

  deleteWarningText: computed('agendaitem.{subcase,subcase.agendaitems}', async function () {
    if (await this.isDeletable) {
      return this.intl.t('delete-agendaitem-message');
    } else if (this.currentSession.isAdmin) {
      return this.intl.t('delete-agendaitem-from-meeting-message');
    }
  }),

  actions: {
    showOptions() {
      this.toggleProperty('showOptions');
    },

    async postponeAgendaItem(agendaitem) {
      agendaitem.set('retracted', true);
      const postPonedObject = this.store.createRecord('postponed', {
        agendaitem: agendaitem
      });
      const subcase = await agendaitem.get('subcase');
      await this.createPostponedPhase(subcase);

      postPonedObject.save().then(postponedTo => {
        agendaitem.set('postponed', postponedTo);
      });
      await subcase.notifyPropertyChange('isPostponed');
      await subcase.hasMany('phases').reload();
      await agendaitem.save();
      await agendaitem.reload();
      await subcase.reload();
    },

    async advanceAgendaitem() {
      const agendaitem = await this.store.findRecord(
        'agendaitem',
        this.agendaitem.get('id')
      );
      const postponedTo = await agendaitem.get('postponedTo');
      const subcase = await agendaitem.get('subcase');
      await this.deletePostponedPhases(subcase);
      if (agendaitem && agendaitem.retracted) {
        agendaitem.set('retracted', false);
      }

      if (agendaitem && postponedTo) {
        await postponedTo.destroyRecord();
      }
      await agendaitem.save();
      await agendaitem.reload();
      await subcase.hasMany('phases').reload();
      await subcase.notifyPropertyChange('isPostponed');
      await subcase.reload();
      await agendaitem.subcase.reload();
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
    }
  },

  async deletePostponedPhases(subcase) {
    const postponedPhases = await subcase.get('postponedPhases');
    if (postponedPhases && postponedPhases.length) {
      await Promise.all(
        postponedPhases.map(phase => {
          phase.destroyRecord();
        })
      );
    }
    return subcase;
  },

  async createPostponedPhase(subcase) {
    const postponedCode = await this.store.findRecord('subcase-phase-code', CONFIG.postponedCodeId);
    const newDecisionPhase = this.store.createRecord('subcase-phase', {
      date: moment()
        .utc()
        .toDate(),
      code: postponedCode,
      subcase: subcase
    });
    return newDecisionPhase.save();
  }
});
