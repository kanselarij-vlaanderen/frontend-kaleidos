// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { updateModifiedProperty } from 'frontend-kaleidos/utils/modification-utils';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  isTableRow: false,
  store: inject(),
  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    async saveChanges(agendaitem) {
      this.set('isLoading', true);
      const agenda = await agendaitem.get('agenda');
      let agendaitemToUpdate;

      if (this.isTableRow) {
        agendaitemToUpdate = agendaitem.content;
      } else {
        agendaitemToUpdate = await agendaitem;
      }
      agendaitemToUpdate.set('formallyOk', CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK);
      await agendaitemToUpdate.save().then(() => {
        updateModifiedProperty(agenda);
        if (this.isTableRow) {
          agendaitem.set('expanded', false);
        }
      });
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    },

    async cancelEditing(agendaitem) {
      if (this.isTableRow) {
        await agendaitem.content.rollbackAttributes();
        agendaitem.set('expanded', false);
      } else {
        agendaitem.rollbackAttributes();
      }
      this.toggleProperty('isEditing');
    },
  },
});
