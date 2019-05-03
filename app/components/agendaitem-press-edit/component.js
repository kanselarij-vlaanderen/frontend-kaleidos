import Component from '@ember/component';
import { inject } from '@ember/service';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';

export default Component.extend(ModifiedMixin, {
	classNames:["vl-form__group vl-u-bg-porcelain"],
	store:inject(),
	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},
		async saveChanges(agendaitem) {
			const agenda = await agendaitem.get('agenda');
			await agendaitem.save().then(() => {
				this.updateModifiedProperty(agenda);
			});
			this.toggleProperty('isEditing');
		},
		async cancelEditing(agendaitem) {
			agendaitem.rollbackAttributes();
			this.toggleProperty('isEditing');
		}
	}
});
