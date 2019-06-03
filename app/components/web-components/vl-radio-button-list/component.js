
import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
export default Component.extend({
	store: inject(),
	classNames: ["vl-u-spacer"],
	modelName: null,
	selectedModel: null,

	model: computed('modelName', 'store', function () {
		return this.store.findAll(this.modelName, { sort: '-label' });
	}),

	async didInsertElement() {
		this._super(...arguments);
		const model = await this.model;
		if (model.length > 1) {
			this.set('selectedModel', model.get('firstObject'));
		}
	},

	actions: {
		modelChanged(event) {
			this.modelChanged(event.target.value);
		}
	}
});
