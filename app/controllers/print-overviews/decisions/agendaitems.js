import Controller from '@ember/controller';
// import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { computed } from '@ember/object';
export default Controller.extend({

	columns: computed(function () {
		return [{
			label: '#',
			width: "50px",
			sortable: true,
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
			sortable: false,
			cellComponent: "web-components/vl-decisions-column",
		},
		{
			label: 'Laatst gewijzigd',
			classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-2"],
			breakpoints: ['mobile', 'tablet', 'desktop'],
			valuePath: 'modified',
			sortable: true,

			cellComponent: "web-components/vl-modified-column"
		},
		{
			width: "150px",
			sortable: false,
			cellComponent: "web-components/vl-table-actions"
		}];
	}),
	actions: {
		async addDecision(row, decisions) {
			const subcase = await row.get('subcase');
			let decision = this.store.createRecord("decision", {
				subcase: await subcase,
				title: await subcase.get('title'),
				shortTitle: await subcase.get('shortTitle'),
				approved: false
			});
			let decisions2 = await decisions;
			decisions2.addObject(decision);
		},
	}
});
