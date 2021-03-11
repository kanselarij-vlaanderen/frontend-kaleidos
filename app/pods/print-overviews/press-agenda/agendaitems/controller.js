import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Controller.extend({
  intl: inject(),

  columns: computed(function() {
    return [{
      label: '#',
      width: '50px',
      sortable: true,
      valuePath: 'priority',
    }, {
      label: this.intl.t('title-and-content'),
      classNames: ['auk-table__col--7 vl-data-table__header-title'],
      cellClassNames: ['auk-table__col--7'],
      sortable: false,
      width: '58.33%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      cellComponent: 'web-components/vl-agendaitem-content-column',
    },
    {
      label: this.intl.t('ministers'),
      classNames: ['auk-table__col--2 vl-data-table__header-title'],
      cellClassNames: ['auk-table__col--2'],
      sortable: false,
      width: '16.66%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      valuePath: 'sortedMandatees',
      cellComponent: 'web-components/vl-mandatees-column',
    },
    {
      label: this.intl.t('for-press'),
      classNames: ['auk-table__col--1 vl-data-table__header-title'],
      cellClassNames: ['auk-table__col--1'],
      breakpoints: ['mobile', 'tablet', 'desktop'],
      sortable: false,
      width: '8.33%',
      cellComponent: 'web-components/light-table/vl-content-toggle',
      valuePath: 'forPress',
    },
    {
      label: this.intl.t('latest-modified'),
      classNames: ['auk-table__col--2 vl-data-table__header-title'],
      cellClassNames: ['auk-table__col--2'],
      breakpoints: ['mobile', 'tablet', 'desktop'],
      valuePath: 'modified',
      sortable: true,
      width: '16.66%',
      cellComponent: 'web-components/vl-modified-column',
    },
    {
      width: '144px',
      sortable: false,
      breakpoints: ['mobile', 'tablet', 'desktop'],
      cellComponent: 'web-components/vl-table-actions',
    }];
  }),
});
