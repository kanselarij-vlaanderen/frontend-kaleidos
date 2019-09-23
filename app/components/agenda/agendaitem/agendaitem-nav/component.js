import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-tabs', 'vl-u-reset-margin'],
  tagName: 'ul',
  activeAgendaItemSection: null,
  currentAgenda: null,

  // This computed property is only for role-based views.
  // Should show the template the user is an editor or if the meeting is final.
  shouldShowFinishedDetails: computed('isEditor', 'currentAgenda.createdFor', async function() {
    const { isEditor, currentAgenda } = this;
    if (isEditor) {
      return true;
    }
    const meeting = await currentAgenda.get('createdFor');
    return meeting.isFinal;
  }),

  actions: {
    setAgendaItemSection(value) {
      this.setAgendaItemSection(value);
    },
  },
});
