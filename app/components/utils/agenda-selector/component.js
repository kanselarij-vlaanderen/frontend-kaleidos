import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import ModelSelectorMixin from 'fe-redpencil/mixins/model-selector-mixin';

export default Component.extend(ModelSelectorMixin, {
	sessionService: inject(),

	items: computed('sessionService.agendas', function () {
		return this.sessionService.get('agendas');
	}),

	actions: {
		selectModel(items) {
			this.selectModel(items);
		},

		resetValueIfEmpty(param) {
			if (param == "") {
				this.set('items', this.sessionService.get('agendas'));
			}
		}
	},
});
