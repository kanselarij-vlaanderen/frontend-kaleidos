import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { not } from '@ember/object/computed';
import { inject } from '@ember/service';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';

const getCachedProperty = function (property) {
	return computed(`item.${property}`, {
		get() {
			const { item } = this;
			if (item)
				return item.get(property);
		},
		set: function (key, value) {
      const { item } = this;
      if(item) {
        this.item.set(property, value);
      }
			return value;
		}
	})
};

const EditAgendaitemOrSubcase = Mixin.create(ModifiedMixin, {
	// XOR
	store: inject(),
	item: null,
	isEditing: false,

	isAgendaItem: computed('item.contructor', function () {
		const { item } = this;
		return item.get('modelName') === 'agendaitem';
	}),

	isSubcase: not('isAgendaItem'),

	async setNewPropertiesToModel(model, resetFormallyOk = true) {
		const { propertiesToSet } = this;

		if(resetFormallyOk) {
			if (model.get('formallyOk') && (this.get('formallyOk') != CONFIG.notYetFormallyOk)) {
				this.changeFormallyOkPropertyIfNotSetOnTrue(model);
			}
		}

		await Promise.all(propertiesToSet.map(async (property) => {
			model.set(property, await this.get(property));
		}));

		return model.save().then((item) => {
			item.reload();
		});
	},

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		async cancelEditing() {
			const item = await this.get('item');
			if(item.get('hasDirtyAttributes')) {
				item.rollbackAttributes();
			}
			if(this.isSubcase) {
				item.belongsTo('type').reload();
				item.belongsTo('accessLevel').reload();
			}
			item.reload();
			this.propertiesToSet.forEach(prop => item.notifyPropertyChange(prop));
			this.toggleProperty('isEditing');
		},

		async saveChanges() {
			this.set('isLoading', true);
			const { isAgendaItem } = this;
			const item = await this.get('item');
      item.set('modified', moment().utc().toDate());
      let resetFormallyOk = true;
			if (isAgendaItem && !item.showAsRemark) {
        if(Object.keys(item.changedAttributes()).length == 2 && item.changedAttributes()['explanation']) {
          resetFormallyOk = false;
        }
				const isDesignAgenda = await item.get('isDesignAgenda');
				const agendaitemSubcase = await item.get('subcase');
				if (isDesignAgenda && agendaitemSubcase) {
					agendaitemSubcase.set('modified', moment().utc().toDate());
					await this.setNewPropertiesToModel(agendaitemSubcase, resetFormallyOk);
				}
				await this.setNewPropertiesToModel(item, resetFormallyOk).then(async () => {
					const agenda = await item.get('agenda');
					if (agenda) {
						await this.updateModifiedProperty(agenda);
					}
					item.reload();
				});
			} else {
				// Don't reset the formalOk when the "showInNewsletter" of a remark is the only change made in the agendaitem
				if(isAgendaItem) {
					if((item.changedAttributes()['showInNewsletter'] || item.changedAttributes()['explanation']) 
            && 
            !(item.changedAttributes()['title'] || item.changedAttributes()['shortTitle'] )) {
						resetFormallyOk = false;
					}
				}

				await this.setNewPropertiesToModel(item, resetFormallyOk);

				const agendaitemsOnDesignAgendaToEdit = await item.get('agendaitemsOnDesignAgendaToEdit');
				if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
					await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
						await this.setNewPropertiesToModel(agendaitem, resetFormallyOk).then(async () => {
							const agenda = await item.get('agenda');
							if (agenda) {
								await this.updateModifiedProperty(agenda);
							}
							item.reload();
						});
					}));
				}
			}
			this.set('isLoading', false);
			this.toggleProperty('isEditing');
		}
	}
})

export { getCachedProperty, EditAgendaitemOrSubcase }
