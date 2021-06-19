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
      classNames: ['auk-table__col--7 auk-table__header-title'],
      cellClassNames: ['auk-table__col--7'],
      sortable: false,
      width: '58.33%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      cellComponent: 'web-components/vl-agendaitem-content-column',
    },
    {
      label: this.intl.t('ministers'),
      classNames: ['auk-table__col--2 auk-table__header-title'],
      cellClassNames: ['auk-table__col--2'],
      sortable: false,
      width: '16.66%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      valuePath: 'sortedMandatees',
      cellComponent: 'web-components/vl-mandatees-column',
    },
    {
      label: this.intl.t('decided'),
      classNames: ['auk-table__col--1 auk-table__header-title'],
      cellClassNames: ['auk-table__col--1'],
      width: '8.33%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      sortable: false,
      cellComponent: 'web-components/vl-decisions-column',
    },
    {
      label: this.intl.t('latest-modified'),
      classNames: ['auk-table__col--2 auk-table__header-title'],
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
      cellComponent: 'web-components/vl-table-actions',
    }];
  }),

  actions: {
    async addTreatment(agendaitemRow) {
      const now = new Date();
      const agendaitem = await this.store.findRecord('agendaitem', agendaitemRow.content.id, {
        include: 'agenda,agenda.created-for',
      });
      const agenda = await agendaitem.agenda;
      const meeting = await agenda.createdFor;
      const startDate = meeting.plannedStart;
      const agendaActivity = await agendaitem.agendaActivity;
      const subcase =  await agendaActivity.subcase;
      const treatment = this.store.createRecord('agenda-item-treatment', {
        created: now,
        modified: now,
        startDate: startDate,
        agendaitem: agendaitem,
        subcase: subcase,
      });
      await treatment.save();
    },
  },
});
