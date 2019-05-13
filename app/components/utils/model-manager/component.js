import Component from '@ember/component';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import ModelManageMixin from 'fe-redpencil/mixins/model-manage-mixin';

export default Component.extend(ModelManageMixin, {
	classNames: ["vl-u-spacer"],
	modelName: null,

	title: getCachedProperty('label'),

	actions: {
		async editModel() {
			const model = await this.get('item');
			model.set('label', this.get('title'));
			model.save().then(() => {
				this.set('title', null);
				this.set('isEditing', false);
			});
		},

		createModel() {
			const governmentDomain = this.store.createRecord(this.get('modelName'), {
				label: this.get('title')
			});
			governmentDomain.save().then(() => {
				this.set('title', null);
				this.set('isAdding', false);
			});
		}
	}
})
