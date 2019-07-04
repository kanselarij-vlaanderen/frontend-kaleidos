import Component from '@ember/component';
import { inject } from '@ember/service';
import ModelSelectorMixin from 'fe-redpencil/mixins/model-selector-mixin';
import { computed } from '@ember/object';

export default Component.extend(ModelSelectorMixin, {
	classNames: ["vlc-input-field-block"],
	store: inject(),
	searchField: null,
	label: null,
	value: null,
	type: "decisions",
	modelName: "shortcut",

	filter: computed('type', function() {
		return { type: this.type};
	}),

	actions: {
		selectModel(items) {
			this.descriptionUpdated(items.get('description'));
		},
	}
});
