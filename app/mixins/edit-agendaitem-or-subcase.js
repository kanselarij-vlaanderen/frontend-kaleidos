import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { not } from '@ember/object/computed';
import { inject } from '@ember/service';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';

const getCachedProperty = function (property) {
	return computed(`item.${property}`, {
		get() {
			const { item } = this;
			if (item)
				return item.get(property);
		},
		set: function (key, value) {
			return value;
		}
	})
}

const EditAgendaitemOrSubcase = Mixin.create(ModifiedMixin, {
	// XOR
	store: inject(),
	item: null,
	isEditing: false,

	isAgendaItem: computed('item', function () {
		const { item } = this;
		const modelName = item.get('constructor.modelName')
		return modelName === 'agendaitem';
	}),

	isSubcase: not('isAgendaItem'),

	changeFormallyOkPropertyIfNotSetOnTrue(subcase) {
		subcase.set('formallyOk', false);
	},

	async setNewPropertiesToModel(model) {
		const { propertiesToSet, isSubcase } = this;
		await Promise.all(propertiesToSet.map(async (property) => {
			model.set(property, await this.get(property));
		}))
		if (isSubcase) {
			this.changeFormallyOkPropertyIfNotSetOnTrue(model);
		}
		return model.save();
	},

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		async cancelEditing() {
			const item = await this.get('item');
			item.reload();
			this.toggleProperty('isEditing');
		},

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
					if (agenda) {
						await this.updateModifiedProperty(agenda);
					}
					item.reload();
				});
			} else {
				await this.setNewPropertiesToModel(item);

				const agendaitemsOnDesignAgendaToEdit = await item.get('agendaitemsOnDesignAgendaToEdit');
				if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
					await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
						await this.setNewPropertiesToModel(agendaitem).then(async () => {
							const agenda = await item.get('agenda');
							if (agenda) {
								await this.updateModifiedProperty(agenda);
							}
							item.reload();
						});
					}));
				}
			}
			this.toggleProperty('isEditing');
		}
	}
})

export { getCachedProperty, EditAgendaitemOrSubcase }
