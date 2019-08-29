import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Controller.extend({
	intl: inject(),
	columns: computed(function () {
		return [{
			label: this.intl.t('first-name'),
			classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-2"],
			sortable: true,
			breakpoints: ['mobile', 'tablet', 'desktop'],
      valuePath: 'firstName'
    },
		{
			label: this.intl.t('last-name'),
			classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-2"],
			sortable: true,
			breakpoints: ['mobile', 'tablet', 'desktop'],
      valuePath: 'lastName'
		},
		{
			label: this.intl.t('national-number'),
			classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-2"],
			breakpoints: ['mobile', 'tablet', 'desktop'],
      valuePath: 'rijksregisterNummer'
		},
		{
			label: this.intl.t('group'),
			classNames: ['vl-data-table-col-4 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-4"],
			breakpoints: ['mobile', 'tablet', 'desktop'],
			valuePath: 'group',
			sortable: true,
			cellComponent: "web-components/light-table/vl-group-column"
		}];
	})
});
