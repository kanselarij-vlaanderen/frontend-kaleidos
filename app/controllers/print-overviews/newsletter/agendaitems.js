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
			classNames: ['vl-data-table-col-7 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-7"],
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
			label: 'In kort bestek',
			classNames: ['vl-data-table-col-1 vl-data-table__header-title'],
			cellClassNames: ["vl-data-table-col-1"],
			breakpoints: ['mobile', 'tablet', 'desktop'],
			sortable: false,
			cellComponent: "web-components/light-table/vl-content-toggle",
			valuePath: 'subcase.newsletterInfo.finished'
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
			width: "144px",
			sortable: false,
			breakpoints: ['mobile', 'tablet', 'desktop'],
			cellComponent: "web-components/vl-table-actions"
		}];
	}),
	async addNewsItem(subcase, agendaitem, value) {
		const news = this.store.createRecord("newsletter-info", {
			subcase: subcase,
			created: new Date(),
			title: await agendaitem.get('shortTitle'),
			subtitle: await agendaitem.get('title'),
			finished: value
		});
		return news.save();
	},

	actions: {
		async addNewsletterInfo(row) {
			const subcase = await row.get('subcase');
			await this.addNewsItem(subcase, row, false);
			await subcase.get('meetingRecord');
		}
	}
});
