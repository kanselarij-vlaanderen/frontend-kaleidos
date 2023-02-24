import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import search from 'frontend-kaleidos/utils/mu-search';
import { parse, startOfDay, endOfDay } from 'date-fns';
import { inject as service } from '@ember/service';

export default class SearchDecisionsRoute extends Route {
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

  textSearchFields = [
    'subcaseTitle^2',
    'subcaseShortTitle^2',
    'decisionName^2',
    'decisionFileName^2',
    'decision.content',
  ];

  model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = { ...searchParams, ...filterParams };

    if (!params.dateFrom) {
      params.dateFrom = null;
    }
    if (!params.dateTo) {
      params.dateTo = null;
    }
    if (!params.mandatees) {
      params.mandatees = null;
    }

    const searchModifier = ':sqs:';
    const textSearchKey = this.textSearchFields.join(',');

    const filter = {};

    if (!isEmpty(params.searchText)) {
      filter[`${searchModifier}${textSearchKey}`] = params.searchText;
    }
    if (!isEmpty(params.mandatees)) {
      filter[':terms:mandateeIds'] = params.mandatees;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(params.dateFrom) && !isEmpty(params.dateTo)) {
      const from = startOfDay(parse(params.dateFrom, 'dd-MM-yyyy', new Date()));
      const to = endOfDay(parse(params.dateTo, 'dd-MM-yyyy', new Date())); // "To" interpreted as inclusive
      filter[':lte,gte:sessionDates'] = [
        to.toISOString(),
        from.toISOString(),
      ].join(',');
    } else if (!isEmpty(params.dateFrom)) {
      const date = startOfDay(parse(params.dateFrom, 'dd-MM-yyyy', new Date()));
      filter[':gte:sessionDates'] = date.toISOString();
    } else if (!isEmpty(params.dateTo)) {
      const date = endOfDay(parse(params.dateTo, 'dd-MM-yyyy', new Date())); // "To" interpreted as inclusive
      filter[':lte:sessionDates'] = date.toISOString();
    }

    if (isEmpty(params.searchText)) {
      return [];
    }
    // Since we want to show the decisions in their agendaitem, we query for
    // agendaitems here while only filtering on decision data, so that we can
    // easily link to the agendaitem route
    return search(
      'agendaitems',
      params.page,
      params.size,
      params.sort,
      filter,
      async (agendaitem) => {
        this.postProcessHighlights(agendaitem);
        const entry = { ...agendaitem.attributes, ...agendaitem.highlight };
        entry.id = agendaitem.id;
        await this.postProcessDecisions(entry);
        return entry;
      },
      {
        fields: ['subcaseShortTitle,subcaseTitle'],
      }
    );
  }

  setupController(controller) {
    super.setupController(...arguments);
    const searchText = this.paramsFor('search').searchText;

    controller.searchText = searchText;
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
    return true;
  }

  async postProcessDecisions(entry) {
    if (entry.decisionResult) {
      entry.decisionResult = await this.store.findRecordByUri(
        'concept',
        entry.decisionResult
      );
    }
  }

  postProcessHighlights(entry) {
    if (Array.isArray(entry.highlight?.subcaseTitle)) {
      entry.highlight.subcaseTitle = entry.highlight.subcaseTitle[0];
    }

    if (Array.isArray(entry.highlight?.subcaseShortTitle)) {
      entry.highlight.subcaseShortTitle = entry.highlight.subcaseShortTitle[0];
    }
  }
}
