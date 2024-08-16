import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaSubmissionsRoute extends Route{
  @service conceptStore;
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
    const statusIds = (
      await this.conceptStore.queryAllByConceptScheme(
        CONSTANTS.CONCEPT_SCHEMES.SUBMISSION_STATUSES
      )
    )
      .filter((status) =>
        [
          CONSTANTS.SUBMISSION_STATUSES.INGEDIEND,
          CONSTANTS.SUBMISSION_STATUSES.IN_BEHANDELING,
          CONSTANTS.SUBMISSION_STATUSES.OPNIEUW_INGEDIEND,
          CONSTANTS.SUBMISSION_STATUSES.TERUGGESTUURD,
          CONSTANTS.SUBMISSION_STATUSES.UPDATE_INGEDIEND,
        ].includes(status.uri)
      )
      .map((status) => status.id);

    const { meeting } = this.modelFor('agenda');
    const options = {
      'filter[meeting][:id:]': meeting.id,
      'filter[status][:id:]': statusIds.join(','),
      include: 'type,status,mandatees.person,mandatees.person.organization,being-treated-by,decisionmaking-flow',
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
