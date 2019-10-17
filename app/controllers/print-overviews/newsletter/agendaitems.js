import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Controller.extend({
  intl: inject(),
  newsletterService: inject(),

  columns: computed(function() {
    return [
      {
        label: '#',
        width: '50px',
        sortable: true,
        valuePath: 'priority',
      },
      {
        label: this.intl.t('newsletter'),
        classNames: ['vl-data-table-col-7 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-7'],
        sortable: false,
        breakpoints: ['mobile', 'tablet', 'desktop'],
        cellComponent: 'web-components/light-table/vl-content-newsletter',
        valuePath: 'subcase',
      },
      {
        label: this.intl.t('ministers'),
        classNames: ['vl-data-table-col-3 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-3'],
        sortable: false,
        breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'sortedMandatees',
        cellComponent: 'web-components/vl-mandatees-column',
      },
      {
        label: this.intl.t("in-newsletter"),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        sortable: false,
        cellComponent: 'web-components/light-table/vl-content-toggle',
        valuePath: 'subcase.newsletterInfo.inNewsletter',
      },
      {
        width: '144px',
        sortable: false,
        breakpoints: ['mobile', 'tablet', 'desktop'],
        cellComponent: 'web-components/vl-table-actions',
      },
    ];
  }),

  actions: {
    async addNewsletterInfo(agendaitem) {
      const subcase = await agendaitem.get('subcase');
      await this.newsletterService.createNewsItemForSubcase(subcase, agendaitem);
      await subcase.get('meetingRecord');
    },
  },
});
