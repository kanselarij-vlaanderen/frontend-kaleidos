import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AgendaSubmissionsRoute extends Route{
  @service store;

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
    const { meeting } = this.modelFor('agenda');
    const options = {
      'filter[meeting][:id:]': meeting.id,
      include: 'type,status,mandatees.person,mandatees.person.organization,being-treated-by',
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    };
    const submissions = await this.store.query('submission', options);
    return submissions;
  }
}
