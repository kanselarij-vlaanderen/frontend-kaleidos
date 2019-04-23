import Component from '@ember/component';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase, getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend(EditAgendaitemOrSubcase, {
	store: inject(),
	classNames: ["vl-form__group", "vl-u-bg-porcelain"],
	propertiesToSet: ['title', 'shortTitle', 'formallyOk', 'confidentiality'],

	title: getCachedProperty('title'),
	shortTitle: getCachedProperty('shortTitle'),
	formallyOk: getCachedProperty('formallyOk'),
	confidentiality: getCachedProperty('confidentiality'),

	actions: {
		selectConfidentiality(confidentiality) {
			this.set('confidentiality', confidentiality)
		}
	}
});
