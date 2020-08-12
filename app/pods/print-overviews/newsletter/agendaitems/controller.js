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
        valuePath: 'agendaActivity.subcase',
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
        label: this.intl.t('in-newsletter'),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        sortable: true,
        cellComponent: 'web-components/light-table/vl-content-toggle',
        valuePath: 'agendaActivity.subcase.newsletterInfo.inNewsletter',
      },
      {
        width: '144px',
        sortable: false,
        breakpoints: ['mobile', 'tablet', 'desktop'],
        cellComponent: 'web-components/vl-table-actions',
      }
    ];
  }),

  actions: {
    async addNewsletterInfo(agendaitem) {
      await this.newsletterService.createNewsItemForAgendaItem(agendaitem);
      // TODO: not sure what below await for "meetingRecord" is about ...
      const agendaActivity = await agendaitem.get('agendaActivity');
      const subcase = await agendaActivity.get('subcase');
      await subcase.get('meetingRecord');
    },
  },
});
