import Component from '@ember/component';
import DocumentsSelectorMixin from 'fe-redpencil/mixins/documents-selector-mixin';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend(DocumentsSelectorMixin, {
	classNames:["vl-form__group vl-u-bg-porcelain"],
	propertiesToSet: ['approved', 'description', 'shortTitle'],

	description: getCachedProperty('description'),
	shortTitle: getCachedProperty('shortTitle'),
	approved: getCachedProperty('approved'),
});
