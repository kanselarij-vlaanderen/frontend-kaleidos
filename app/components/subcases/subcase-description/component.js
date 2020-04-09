import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { computed, get, set } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import { inject } from '@ember/service';
import { saveChanges as saveSubcaseDescription, cancelEdit } from 'fe-redpencil/utils/agenda-item-utils';

export default Component.extend(isAuthenticatedMixin, {
  store: inject(),
  classNames: ['vl-u-spacer-extended-bottom-l'],
  propertiesToSet: Object.freeze(['subcaseName', 'type', 'showAsRemark']),

  item: computed('subcase', function () {
    return this.get('subcase');
  }),

  subcaseName: getCachedProperty('subcaseName'),
  type: getCachedProperty('type'),
  showAsRemark: getCachedProperty('showAsRemark'),

  remarkType: computed('subcase.remarkType', function () {
    return this.subcase.get('remarkType');
  }),

  latestMeetingId: computed('subcase.latestMeeting', function () {
    return this.subcase.get('latestMeeting').then(meeting => meeting.id);
  }),

  latestAgendaId: computed('subcase.latestAgenda', function () {
    return this.subcase.get('latestAgenda').then(agenda => agenda.id);
  }),

  latestAgendaItemId: computed('subcase.latestAgendaItem', function () {
    return this.subcase.get('latestAgendaItem').then(item => item.id);
  }),

  actions: {
    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    async cancelEditing() {
      const item = await this.get('item');
      cancelEdit(item, get(this, 'propertiesToSet'));
      set(this, 'isEditing', false);
    },

    async selectType(type) {
      const subcase = this.get('subcase');
      const caze = await subcase.get('case');
      const subcaseName = await caze.getNameForNextSubcase(subcase, type);
      this.set('type', type);
      this.set('subcaseName', subcaseName);
    },

    selectRemarkType(item) {
      this.set('remarkType', item);
      if (item.get('id') === CONFIG.remarkId) {
        this.set('showAsRemark', true);
      } else {
        this.set('showAsRemark', false);
      }
    },

    async saveChanges() {
      const resetFormallyOk = true;
      set(this, 'isLoading', true);
      await saveSubcaseDescription(get(this, 'item'), get(this, 'propertiesToSet'), get(this, 'propertiesToSet'), resetFormallyOk);
      set(this, 'isLoading', false);
      this.toggleProperty('isEditing');
    }
  }
});
