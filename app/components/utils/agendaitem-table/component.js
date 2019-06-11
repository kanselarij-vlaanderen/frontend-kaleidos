import Component from '@ember/component';
import { computed } from '@ember/object';
import LightTableMixin from 'fe-redpencil/mixins/light-table-mixin';

export default Component.extend(LightTableMixin, {
	classNames: ["container-flex"],

	columns: computed(function () {
		return [{
			label: '#',
			width: "50px",
			valuePath: 'priority',
		}, {
			label: 'Titel en inhoud',
			classNames: ['vl-data-table-col-6 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-6"],
			sortable: false,
			breakpoints: ['mobile', 'tablet', 'desktop'],
			cellComponent: "web-components/vl-content-column",
		},
		{
			label: 'Mandatees',
			classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-2"],
			sortable: false,
			breakpoints: ['mobile', 'tablet', 'desktop'],
			valuePath: 'mandatees',
			cellComponent: 'web-components/vl-mandatees-column'
		},
		{
			label: 'In kort bestek',
			classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-2"],
			breakpoints: ['mobile', 'tablet', 'desktop'],
			valuePath: 'forPress',
			cellComponent: 'web-components/vl-toggle'
		},
		{
			label: 'Laatst gewijzigd',
			classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-2"],
			breakpoints: ['mobile', 'tablet', 'desktop'],
			valuePath: 'modified'
		},
		{
			width: "150px",
			sortable: false,
			cellComponent: "web-components/vl-table-actions"
		}];
	}),
	actions: {
		async addDecision(subcase) {
			let decision = this.store.createRecord("decision", {
				subcase: await subcase,
				title: await subcase.get('title'),
				shortTitle: await subcase.get('shortTitle'),
				approved: false
			});
			subcase.set('decision', decision);
		},
	}
});
