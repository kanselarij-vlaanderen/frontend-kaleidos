import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { not } from '@ember/object/computed';
import { inject } from '@ember/service';

const getCachedProperty = function (property) {
	return computed(property, {
		get() {
			const { item } = this;
			return item.get(property);
		},
		set: function (key, value) {
			return value;
		}
	})
}

const EditAgendaitemOrSubcase = Mixin.create({
	// XOR
	store:inject(),
	item: null,
	isEditing:false,
	propertiesToSet: ['title', 'shortTitle', 'formallyOk', 'confidentiality'],

	isAgendaItem: computed('item', function () {
		const { item } = this;
		const modelName = item.get('constructor.modelName')
		return modelName === 'agendaitem';
	}),

	isSubcase: not('isAgendaItem'),

	async setNewPropertiesToModel(model) {
		const { propertiesToSet } = this;
		propertiesToSet.map((property) => {
			model.set(property, this.get(property));
		})

		return model.save();
	},

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		cancelEditing() {
			const { item } = this;
			item.reload();
			this.toggleProperty('isEditing');
		},

		async saveChanges() {
			const { item, isAgendaItem } = this;
			if (isAgendaItem) {
				const isDesignAgenda = await item.get('isDesignAgenda');
				if (isDesignAgenda) {
					const agendaitemSubcase = await item.get('subcase');
					await this.setNewPropertiesToModel(agendaitemSubcase);
				}
				this.setNewPropertiesToModel(item).then(() => {
					this.toggleProperty('isEditing');
				});
			} else {
				await this.setNewPropertiesToModel(item);

				const agendaitemsOnDesignAgendaToEdit = await item.get('agendaitemsOnDesignAgendaToEdit');
				if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
					agendaitemsOnDesignAgendaToEdit.map((agendaitem) => {
						this.setNewPropertiesToModel(agendaitem).then(() => {
							this.toggleProperty('isEditing');
						});
					})
				}
			}
		}
	}
})

export { getCachedProperty, EditAgendaitemOrSubcase }
