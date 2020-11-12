import Route from '@ember/routing/route';
import EmberObject, { action } from '@ember/object';
import moment from 'moment';
import search from 'fe-redpencil/utils/mu-search';
import { task } from 'ember-concurrency-decorators';

class Case extends EmberObject {
  @task({
    maxConcurrency: 2,
    restartable: false,
  })
  *loadDocumentsCount(store) {
    const res = yield store.query('piece', { // TODO: How to inject store here?
      'filter[cases][:id:]': this.id,
      page: {
        size: 1,
      },
    });
    return this.set('documentsCount', res.meta.count);
  }
}

export default class ToTreatRoute extends Route {
  queryParams = {
    page: {
      refreshModel: true,
    },
    size: {
      refreshModel: true,
    },
  };

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

  async model(params) {
    const today = new Date();
    const date = moment(today, 'DD-MM-YYYY').endOf('day');
    const filter = {};
    const sort = '-session-dates';
    filter[':sqs:title'] = '*'; // search without filter
    filter[':lte:sessionDates'] = date.utc().toISOString();
    filter.agendaStatus = 'Goedgekeurd';
    return await search('cases', params.page, params.size, sort, filter, (item) => {
      const entry = Case.create(item.attributes);
      if (typeof item.attributes.meetingId === 'string') {
        const meeting = this.store.findRecord('meeting', item.attributes.meetingId);
        entry.meeting = meeting;
      }
      entry.id = item.id;
      return entry;
    });
  }

  afterModel(model) {
    model.forEach((_case) => {
      _case.loadDocumentsCount.perform(this.store);
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
