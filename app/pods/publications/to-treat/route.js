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
    searchText: {
      refreshModel: true,
      as: 'zoekterm',
    },
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

    if (typeof params.searchText === 'string' && params.searchText !== '') {
      filter[':sqs:shortTitle'] = params.searchText;
    } else {
      filter[':sqs:shortTitle'] = '*'; // search without filter
    }

    filter[':lte:sessionDates'] = date.utc().toISOString();
    filter.agendaStatus = 'Goedgekeurd';

    // Fetch dossiers from search api.
    const cases = search('cases', params.page, params.size, sort, filter, (item) => {
      // Create case object from search_result data.
      const entry = Case.create(item.attributes);

      if (typeof item.attributes.meetingId === 'string') {
        // if dossier only linked to 1 meeting
        entry.meeting = this.store.findRecord('meeting', item.attributes.meetingId);
      } else {
        // older data sometimes has this.
        entry.meeting = this.store.query('meeting', {
          filter: {
            id: item.attributes.meetingId[0],
          },
        });
      }

      if (item.attributes.publicationFlowId) {
        if (typeof item.attributes.publicationFlowId === 'string') {
          entry.publicationFlow = this.store.findRecord('publication-flow', item.attributes.publicationFlowId, {
            reload: true,
          });
        } else {
          entry.publicationFlow = this.store.findRecord('publication-flow', item.attributes.publicationFlowId[0], {
            reload: true,
          });
        }
      }

      entry.id = item.id;
      return entry;
    });

    // We receive the cases sorted by agenda.
    // We need to add in the meeting data for this to visualise in the ember data table.
    // Only shows the meeting header once for all dossiers.
    const outputCases = [];
    const addedAgendas = [];
    await cases.then((cases) => {
      const casesArray = cases.map((_case) => _case);
      for (let index = 0; index < casesArray.length; index++) {
        const currentCase = casesArray[index];
        // If meeting not already added?
        if (!addedAgendas.includes(currentCase.meetingId)) {
          // Add agenda
          if (!Array.isArray(currentCase.meetingId)) {
            addedAgendas.push(currentCase.meetingId);
            outputCases.push({
              isAgendaRow: true,
              meeting: currentCase.meeting,
            });
          } else {
            // This should only happen with old data.
            addedAgendas.concat(currentCase.meetingId);
          }
        } else {
          // The agenda was already added.
        }
        // Add the cases also to the output list.
        outputCases.push(casesArray[index]);
      }
    });
    return outputCases;
  }

  afterModel(model) {
    model.forEach((_case) => {
      if (_case.loadDocumentsCount) {
        _case.loadDocumentsCount.perform(this.store);
      }
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
