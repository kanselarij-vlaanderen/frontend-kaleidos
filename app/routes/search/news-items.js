import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { parse, startOfDay, endOfDay } from 'date-fns';
import search from 'frontend-kaleidos/utils/mu-search';

export default class SearchNewsItemsRoute extends Route {
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

  textSearchFields = ['title^3', 'subtitle^3', 'htmlContent'];

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
    } if (!isEmpty(params.mandatees)) {
      filter[':terms:agendaitems.mandatees.id'] = params.mandatees;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(params.dateFrom) && !isEmpty(params.dateTo)) {
      const from = startOfDay(parse(params.dateFrom, 'dd-MM-yyyy', new Date()));
      const to = endOfDay(parse(params.dateTo, 'dd-MM-yyyy', new Date())); // "To" interpreted as inclusive
      filter[':lte,gte:agendaitems.meetingDate'] = [to.toISOString(), from.toISOString()].join(',');
    } else if (!isEmpty(params.dateFrom)) {
      const date = startOfDay(parse(params.dateFrom, 'dd-MM-yyyy', new Date()));
      filter[':gte:agendaitems.meetingDate'] = date.toISOString();
    } else if (!isEmpty(params.dateTo)) {
      const date = endOfDay(parse(params.dateTo, 'dd-MM-yyyy', new Date())); // "To" interpreted as inclusive
      filter[':lte:agendaitems.meetingDate'] = date.toISOString();
    }

    // Filter out news-items that are not linked to a meeting via treatment(s)/agendaitem(s)
    filter[':has:agendaitems'] = 't';

    if (isEmpty(params.searchText)) {
      return [];
    }

    return search('news-items', params.page, params.size, params.sort, filter, (newsItem) => {
      const entry = newsItem.attributes;
      entry.id = newsItem.id;
      this.postProcessAgendaitems(newsItem);
      this.postProcessDecisions(newsItem);
      this.postProcessMandatees(newsItem);
      return entry;
    });
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
    // Disable bubbling of loading event to prevent parent loading route to be shown.
    // Otherwise it causes a 'flickering' effect because the search filters disappear.
    return false;
  }

  postProcessAgendaitems(newsletter) {
    const agendaitems = newsletter.attributes.agendaitems;
    if (Array.isArray(agendaitems)) {
      newsletter.attributes.latestAgendaitem = agendaitems.find((agendaitem) => {
        return agendaitem['nextVersionId'] == null;
      });
    } else {
      newsletter.attributes.latestAgendaitem = agendaitems;
    }
  }

  postProcessDecisions(newsletter) {
    const decisions = newsletter.attributes.decisions;
    if (Array.isArray(decisions)) {
      // TODO for now, if there are multiple decisions, we just grab the first one
      newsletter.attributes.decision = decisions.firstObject;
    } else {
      newsletter.attributes.decision = decisions;
    }
  }

  postProcessMandatees(newsletter) {
    const mandatees = newsletter.attributes.latestAgendaitem.mandatees;
    if (Array.isArray(mandatees)) {
      const sortedMandatees = mandatees.sortBy('priority');
      newsletter.attributes.mandatees = sortedMandatees;
    } else {
      newsletter.attributes.mandatees = [mandatees];
    }
  }
}
