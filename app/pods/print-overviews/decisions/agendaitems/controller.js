import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from "moment";

export default Controller.extend({
  intl: inject(),

  columns: computed(function () {
    return [{
      label: '#',
      width: '50px',
      sortable: true,
      valuePath: 'priority',
    }, {
      label: this.intl.t('title-and-content'),
      classNames: ['vl-data-table-col-7 vl-data-table__header-title'],
      cellClassNames: ['vl-data-table-col-7'],
      sortable: false,
      breakpoints: ['mobile', 'tablet', 'desktop'],
      cellComponent: 'web-components/vl-agendaitem-content-column',
    },
      {
        label: this.intl.t('ministers'),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
        sortable: false,
        breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'sortedMandatees',
        cellComponent: 'web-components/vl-mandatees-column'
      },
      {
        label: this.intl.t('decided'),
        classNames: ['vl-data-table-col-1 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-1'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        sortable: false,
        cellComponent: 'web-components/vl-decisions-column',
      },
      {
        label: this.intl.t('latest-modified'),
        classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
        cellClassNames: ['vl-data-table-col-2'],
        breakpoints: ['mobile', 'tablet', 'desktop'],
        valuePath: 'modified',
        sortable: true,
        cellComponent: 'web-components/vl-modified-column'
      },
      {
        width: '144px',
        sortable: false,
        cellComponent: 'web-components/vl-table-actions'
      }];
  }),

  actions: {
    async addTreatment(agendaitemRow) {
      const agendaitem =  await this.store.findRecord('agendaitem', agendaitemRow.content.id, {
        include: 'agenda-activity,agenda-activity.subcase'
      });
      const agendaActivity = await agendaitem.get('agendaActivity');
      const subcase = await agendaActivity.get('subcase');
      //const decisionResultCode = await this.store.findRecord('decision-result-code', 'a29b3ffd-0839-45cb-b8f4-e1760f7aacaa');

      let treatment = this.store.createRecord('agenda-item-treatment', {
        created: moment().utc().toDate(),
        modified: moment().utc().toDate(),
        agendaitem: agendaitem,
        //decisionResultCode,
      });
      const savedTreatment = await treatment.save();
      //(await subcase.get('treatments')).addObject(savedTreatment);
    },
  }
});
