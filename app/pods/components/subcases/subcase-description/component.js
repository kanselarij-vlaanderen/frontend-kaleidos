import Component from '@ember/component';
import {
  computed, set
} from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import { inject } from '@ember/service';
import { cached } from 'fe-redpencil/decorators/cached';
import {
  saveChanges as saveSubcaseDescription, cancelEdit
} from 'fe-redpencil/utils/agendaitem-utils';

export default Component.extend({
  store: inject(),
  currentSession: inject(),
  classNames: ['auk-u-mb-8'],
  subcase: null,

  subcaseName: cached('subcase.subcaseName'), // TODO in class syntax use as a decorator instead
  type: cached('subcase.type'), // TODO in class syntax use as a decorator instead
  showAsRemark: cached('subcase.showAsRemark'), // TODO in class syntax use as a decorator instead

  remarkType: computed('subcase.remarkType', function() {
    return this.subcase.get('remarkType');
  }),

  caseTypes: computed('store', async function() {
    return await this.store.query('case-type', {
      sort: '-label',
      filter: {
        deprecated: false,
      },
    });
  }),

  latestMeetingId: computed('subcase.latestMeeting', function() {
    return this.subcase.get('latestMeeting').then((meeting) => meeting.id);
  }),

  latestAgendaId: computed('subcase.latestAgenda', function() {
    return this.subcase.get('latestAgenda').then((agenda) => agenda.id);
  }),

  latestAgendaitemId: computed('subcase.latestAgendaitem', function() {
    return this.subcase.get('latestAgendaitem').then((agendaitem) => agendaitem.id);
  }),

  isRetracted: computed('subcase.latestAgendaitem', function() {
    return this.subcase.get('latestAgendaitem').then((agendaitem) => agendaitem.retracted);
  }),

  actions: {
    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    async cancelEditing() {
      const propertiesToSetOnSubCase = {
        subcaseName: this.get('subcaseName'),
        type: this.get('type'),
        showAsRemark: this.get('showAsRemark'),
      };
      cancelEdit(this.subcase, propertiesToSetOnSubCase);
      set(this, 'isEditing', false);
    },

    async selectType(type) {
      const subcaseName = type.get('label');
      this.set('type', type);
      this.set('subcaseName', subcaseName);
    },

    selectRemarkType(id) {
      if (id === CONFIG.remarkId) {
        this.set('showAsRemark', true);
      } else {
        this.set('showAsRemark', false);
      }
    },

    async saveChanges() {
      const resetFormallyOk = true;
      set(this, 'isLoading', true);

      const propertiesToSetOnAgendaitem = {
        showAsRemark: this.get('showAsRemark'),
      };

      const propertiesToSetOnSubCase = {
        subcaseName: this.get('subcaseName'),
        type: this.get('type'),
        showAsRemark: this.get('showAsRemark'),
      };
      await saveSubcaseDescription(this.subcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubCase, resetFormallyOk);
      set(this, 'isLoading', false);
      this.toggleProperty('isEditing');
    },
  },
});
