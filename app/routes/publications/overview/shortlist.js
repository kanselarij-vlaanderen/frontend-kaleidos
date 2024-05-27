import Route from '@ember/routing/route';
import fetch from 'fetch';
import { inject as service } from '@ember/service';

export default class PublicationsOverviewShortlistRoute extends Route {
  @service store;

  queryParams = {
    sort: {
      refreshModel: true,
      as: 'sorteer',
    },
  };

  async model(params) {
    const endpoint = '/publication-flows/shortlist';
    const response = await fetch(endpoint, {
      Headers: {
        'Accept': 'application/vnd.api+json',
      }
    });
    const result = await response.json();

    if (result?.data?.length) {
      return this.store.query('piece', {
        include: [
          'agendaitems.agenda',
          'agendaitems.agenda.next-version',
          'agendaitems.agenda.created-for',
          'agendaitems.mandatees.person',
          'agendaitems.treatment.decision-activity',
          'document-container.type',
        ].join(','),
        sort: params.sort,
        'filter[:id:]': result.data.map((record) => record.id).join(','),
      });
    }

    return [];
  }
}
