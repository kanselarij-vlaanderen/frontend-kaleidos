import Component from '@ember/component';
import { inject } from '@ember/service';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';

export default Component.extend(ModifiedMixin, {
	classNames: ["vl-form__group vl-u-bg-porcelain"],
	store: inject(),

	actions: {
		async saveChanges(agendaitem) {
			const meetingRecord = await agendaitem.get('meetingRecord');
			const recordToSave = await this.store.findRecord('meeting-record', meetingRecord.get('id'));
			const agenda = await this.get('agendaitem.agenda');
			await recordToSave.save();
			await this.updateModifiedProperty(agenda);
			this.toggleProperty('isEditing');
		},
		async cancelEditing(agendaitem) {
			const meetingRecord = await this.store.findRecord('meeting-record', await agendaitem.get('meetingRecord.id'));
			meetingRecord.rollbackAttributes();
			this.toggleProperty('isEditing');
		}
	}
});
