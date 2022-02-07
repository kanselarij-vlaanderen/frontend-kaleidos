import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class PublicationsOverviewLateRoute extends Route {
  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
    sort: {
      refreshModel: true,
      as: 'sorteer',
    },
  };

  async model(params) {
    const publicationStatuses = this.store.peekAll('publication-status');
    const pendingStatuses = publicationStatuses.rejectBy('isFinal');
    const pendingFilter = pendingStatuses.mapBy('id').join(',');

    return this.store.query('publication-flow', {
      'filter[status][:id:]': pendingFilter,
      // notice: due-date is datetime but appears as a date to the user
      // If a user enters '2022-02-07', it is saved as '2022-02-06 23:00 UTC'
      // This is interpreted as < 2022-02-08 00:00 Flemish time. => due-datetime + 1 day
      // We do a (due-date < startOfDay) check. This allows decisions published
      // in the course of the day not to be marked as overdue.
      // @see also: `get isOverdue` in publication-subcase
      'filter[publication-subcase][:lt:due-date]': getStartOfToday().toISOString(),
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      // eslint-disable-next-line prettier/prettier
      include: [
        'identification',
        'status',
        'publication-subcase',
        'translation-subcase',
        'case',
      ].join(','),
    });
  }

  @action
  loading(transition) {
    // see snippet in https://api.emberjs.com/ember/3.27/classes/Route/events/loading?anchor=loading
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
  }
}

/** inspired by {@link https://date-fns.org/v2.28.0/docs/startOfToday} */
function getStartOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0);
  return date;
}
