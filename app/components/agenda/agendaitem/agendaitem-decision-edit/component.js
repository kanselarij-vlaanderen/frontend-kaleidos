import Component from '@ember/component';
import DocumentsSelectorMixin from 'fe-redpencil/mixins/documents-selector-mixin';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend(DocumentsSelectorMixin, {
	classNames: ["vl-form__group vl-u-bg-porcelain"],
	propertiesToSet: ['approved', 'description', 'shortTitle'],

	description: getCachedProperty('description'),
	shortTitle: getCachedProperty('shortTitle'),
	approved: getCachedProperty('approved'),

	actions: {
		async saveChanges() {
			const { isAgendaItem } = this;
			const item = await this.get('item');
			item.set('modified', new Date());
			if (isAgendaItem && !item.showAsRemark) {
				const isDesignAgenda = await item.get('isDesignAgenda');
				if (isDesignAgenda) {
					const agendaitemSubcase = await item.get('subcase');
					agendaitemSubcase.set('modified', new Date());
					await this.setNewPropertiesToModel(agendaitemSubcase);
				}
				await this.setNewPropertiesToModel(item).then(async () => {
					const agenda = await item.get('agenda');
					this.updateModifiedProperty(agenda);
					item.reload();
				});
			} else {
				await this.setNewPropertiesToModel(item);

				const agendaitemsOnDesignAgendaToEdit = await item.get('agendaitemsOnDesignAgendaToEdit');
				if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
					await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
						await this.setNewPropertiesToModel(agendaitem).then(async () => {
							const agenda = await item.get('agenda');
							this.updateModifiedProperty(agenda).then((agenda) => {
								agenda.reload();
							});
							item.reload();
						});
					}));
				}
			}
			this.toggleProperty('isEditing');
		}
	}
});
