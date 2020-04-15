import Component from '@ember/component';
import { inject } from '@ember/service';
import RdfaEditorMixin from 'fe-redpencil/mixins/rdfa-editor-mixin';
import { computed } from '@ember/object';
import { cached } from 'fe-redpencil/decorators/cached';
import { updateModifiedProperty } from 'fe-redpencil/utils/modification-utils';

export default Component.extend(RdfaEditorMixin, {
  classNames: ['vl-form__group vl-u-bg-porcelain'],
  store: inject(),

  item: computed('agendaitem.meetingRecord', function () {
    return this.get('agendaitem.meetingRecord');
  }),

  initValue: cached('item.richtext'), // TODO in class syntax use as a decorator instead

  actions: {
    async saveChanges(agendaitem) {
      this.set('isLoading', true);
      const meetingRecord = await agendaitem.get('meetingRecord');
      const recordToSave = await this.store.findRecord('meeting-record', meetingRecord.get('id'));
      const agenda = await this.get('agendaitem.agenda');
      const richtext = await this.get('richtext');
      recordToSave.set('richtext', richtext);
      await recordToSave.save();

      await updateModifiedProperty(agenda);
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    },

    async cancelEditing(agendaitem) {
      const meetingRecord = await this.store.findRecord('meeting-record', await agendaitem.get('meetingRecord.id'));
      meetingRecord.rollbackAttributes();
      this.toggleProperty('isEditing');
    },

    descriptionUpdated(val) {
      this.set('initValue', this.richtext + val);
    }
  }
});
