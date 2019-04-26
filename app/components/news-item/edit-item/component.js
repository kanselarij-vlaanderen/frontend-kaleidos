import Component from '@ember/component';
import DocumentsSelectorMixin from 'fe-redpencil/mixins/documents-selector-mixin';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend(DocumentsSelectorMixin, {
	classNames: ["vl-form__group vl-u-bg-porcelain"],
	propertiesToSet: ['finished', 'title', 'text'],

	subtitle: getCachedProperty('subtitle'),
	text: getCachedProperty('text'),
	finished: getCachedProperty('finished'),
});
