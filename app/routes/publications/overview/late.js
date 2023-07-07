import PublicationsOverviewBaseRoute from './_base';
import { inject as service } from '@ember/service';

export default class PublicationsOverviewLateRoute extends PublicationsOverviewBaseRoute {
  @service store;

  templateName = 'publications.overview.all';

  defaultColumns= [
    'publicationNumber',
    'numacNumber',
    'shortTitle',
    'publicationTargetDate',
    'publicationDueDate',
  ];
  tableConfigStorageKey = "publication-table.all";

  beforeModel() {
    super.beforeModel(...arguments);
    const pendingStatuses = this.store.peekAll('publication-status').filter((s) => !s.isFinal);
    this.filter = {
      status: {
        ':id:': pendingStatuses.map((s) => s.id).join(','),
      },
      'publication-subcase': {
        // notice: target-end-date is datetime but appears as a date to the user
        // If a user enters '2022-02-07', it is saved as '2022-02-06 23:00 UTC'
        // This is interpreted as < 2022-02-08 00:00 Flemish time. => due-datetime + 1 day
        // We do a (target-end-date < startOfDay) check. This allows decisions published
        // in the course of the day not to be marked as overdue.
        // @see also: `get isOverdue` in publication-subcase
        ':lt:target-end-date': getStartOfToday().toISOString(),
      },
    };
  }
}

/** inspired by {@link https://date-fns.org/v2.28.0/docs/startOfToday} */
function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}
