import Route from '@ember/routing/route';
import { action } from '@ember/object';
import moment from 'moment';
import search from 'fe-redpencil/utils/mu-search';

export default class ToTreatRoute extends Route {
  postProcessDates(_case) {
    const {
      sessionDates,
    } = _case.attributes;
    if (sessionDates) {
      if (Array.isArray(sessionDates)) {
        const sorted = sessionDates.sort();
        _case.attributes.sessionDates = sorted[sorted.length - 1];
      } else {
        _case.attributes.sessionDates = moment(sessionDates);
      }
    }
  }

  async model() {
    // const today = new Date();
    const filter = {};
    // filter[':lte:sessionDates'] = today.toISOString();

    const sort = '-session-dates';
    const size = 50;
    const page = 0;
    filter[':sqs:title'] = '*'; // search without filter

    return await search('cases', page, size, sort, filter, (item) => {
      const entry = item.attributes;
      entry.id = item.id;
      return entry;
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }

  @action
  refresh() {
    super.refresh();
  }
}
