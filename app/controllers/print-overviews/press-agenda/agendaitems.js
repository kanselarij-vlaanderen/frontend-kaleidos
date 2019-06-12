import Controller from '@ember/controller';
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
			label: 'Ministers',
			classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-2"],
			sortable: false,
			breakpoints: ['mobile', 'tablet', 'desktop'],
			valuePath: 'mandatees',
			cellComponent: 'web-components/vl-mandatees-column'
		},
		{
			label: 'Publiek',
			classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-2"],
			breakpoints: ['mobile', 'tablet', 'desktop'],
			sortable: false,
			cellComponent: "web-components/vl-toggle",
			valuePath: "forPress"
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
	})
});
