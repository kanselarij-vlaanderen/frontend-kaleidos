import Component from '@ember/component';
import { inject } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import { updateModifiedProperty } from 'fe-redpencil/utils/modification-utils';

export default Component.extend({
  classNames: ['vl-form__group vl-u-bg-porcelain'],
  isTableRow: false,
  store: inject(),
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
      agendaitemToUpdate.set('formallyOk', CONFIG.notYetFormallyOk);
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
        agendaitem.set('expanded', false)
      } else {
        agendaitem.rollbackAttributes();
      }
      this.toggleProperty('isEditing');
    }
  }
});
