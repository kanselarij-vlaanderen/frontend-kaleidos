import Route from '@ember/routing/route';
import fetch from 'fetch';
import { inject as service } from '@ember/service';
import { getJsonPayloadOrThrow } from 'frontend-kaleidos/utils/json-util';

export default class PublicationsOverviewShortlistRoute extends Route {
  @service store;
  @service toaster;
  @service intl;

  queryParams = {
    sortShortlist: {
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
    let result;
    try {
      result = await getJsonPayloadOrThrow(response);
    } catch (error) {
      const message = error?.message ? `: ${error?.message}` : '';
      this.toaster.error(
        this.intl.t('shortlist-publication-error-message') + `${message}`,
        this.intl.t('warning-title')
      );
    }

    if (result?.data?.length) {
      const model = await this.store.queryAll('piece', {
        include: ['agendaitems.treatment.decision-activity'].join(','),
        sort: params.sortShortlist,
        'filter[:id:]': result.data.map((record) => record.id).join(','),
      });
      // the above works but 5 id's can turn into 7 piece records with duplicates
      // if agendaitem position was changed between agendas
      return new Set(model.slice());
    }
    return [];
  }
}
