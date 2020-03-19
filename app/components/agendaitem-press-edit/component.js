import Component from '@ember/component';
import { inject } from '@ember/service';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import moment from 'moment';

export default Component.extend(ModifiedMixin, {
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
      agendaitemToUpdate.set('modified', moment().utc().toDate());
      this.changeFormallyOkPropertyIfNotSetOnTrue(agendaitemToUpdate);
      await agendaitemToUpdate.save().then(() => {
        this.updateModifiedProperty(agenda);
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
