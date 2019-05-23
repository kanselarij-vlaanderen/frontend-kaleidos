import Component from '@ember/component';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase, getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { computed } from '@ember/object';

export default Component.extend(EditAgendaitemOrSubcase, {
	store: inject(),
	classNames: ["vl-form__group", "vl-u-bg-porcelain"],
	propertiesToSet: ['title', 'shortTitle', 'formallyOk', 'confidentiality', 'confidential'],

	title: getCachedProperty('title'),
	shortTitle: getCachedProperty('shortTitle'),
	confidential: computed(`item.confidential`, `item.subcase.confidential`, {
		get() {
			if (this.get('isAgendaItem')) {
				return this.get('item.subcase.confidential');
			} else {
				return this.get('item.confidential');
			}
		},
		set: function (key, value) {
			return value;
		}
	}),

	formallyOk: getCachedProperty('formallyOk'),
	confidentiality: getCachedProperty('confidentiality'),

	actions: {
		selectConfidentiality(confidentiality) {
			this.set('confidentiality', confidentiality)
		}
	}
});
