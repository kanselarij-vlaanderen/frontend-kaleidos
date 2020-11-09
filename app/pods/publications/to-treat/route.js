import Route from '@ember/routing/route';
import EmberObject, { action } from '@ember/object';
import moment from 'moment';
import search from 'fe-redpencil/utils/mu-search';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';

class Case extends EmberObject {
  @service store;

  @task({
    maxConcurrency: 2,
    restartable: false,
  })
  *loadDocumentsCount() {
    const res = yield this.store.query('piece', {
      'filter[cases][:id:]': this.id,
      'page[size]': 0,
    });
    return this.set('documentsCount', res.meta.count);
  }
}

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
      const entry = Case.create(item.attributes); // EmberObject for tracking
      entry.id = item.id;
      return entry;
    });
  }

  afterModel(model) {
    model.forEach((_case) => {
      _case.loadDocumentsCount.perform();
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
