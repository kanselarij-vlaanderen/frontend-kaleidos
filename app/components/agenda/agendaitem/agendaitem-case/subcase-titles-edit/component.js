import Component from '@ember/component';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase, getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { computed } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
import EmberObject from '@ember/object';

export default Component.extend(EditAgendaitemOrSubcase, {
	store: inject(),
	classNames: ["vl-form__group", "vl-u-bg-porcelain"],
	propertiesToSet: ['title', 'shortTitle', 'formallyOk', 'confidentiality', 'confidential'],

	options: computed(function () {
		return CONFIG.formallyOkOptions.map((item) => {
			return EmberObject.create(item);
		})
	}),

	selectedFormallyOk: computed('options', 'formallyOk', function () {
		const formallyOk = this.get('formallyOk');
		if (!formallyOk) {
			return this.options.find((option) => option.get('uri') === CONFIG.notYetFormallyOk);
		} else {
			return this.options.find((option) => option.get('uri') === formallyOk);
		}
	}),

	formallyOk: getCachedProperty('formallyOk'),
	title: getCachedProperty('title'),
	confidentiality: getCachedProperty('confidentiality'),
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


	actions: {
		selectConfidentiality(confidentiality) {
			this.set('confidentiality', confidentiality)
		},

		setAction(item) {
			this.set('selectedFormallyOk', item);
			this.set('formallyOk', item.get('uri'))
		}
	}
});
