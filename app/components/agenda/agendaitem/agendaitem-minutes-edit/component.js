import Component from '@ember/component';
import { inject } from '@ember/service';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';

export default Component.extend(ModifiedMixin, {
	classNames:["vl-form__group vl-u-bg-porcelain"],
	store:inject(),

	actions: {
		async saveChanges(agendaitem) {
			const recordToSave = this.store.peekRecord('meeting-record', await agendaitem.get('meetingRecord.id'));
			const agenda = await this.get('agendaitem.agenda');
			await recordToSave.save();
			await this.updateModifiedProperty(agenda);
			this.toggleProperty('isEditing');
		},
		async cancelEditing(agendaitem) {
			const meetingRecord = this.store.peekRecord('meeting-record', await agendaitem.get('meetingRecord.id'));
			meetingRecord.rollbackAttributes();
			this.toggleProperty('isEditing');
		}
	}
});
