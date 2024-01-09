import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { parse, startOfDay, endOfDay } from 'date-fns';
import search from 'frontend-kaleidos/utils/mu-search';
import filterStopWords from 'frontend-kaleidos/utils/filter-stopwords';

export default class SearchNewsItemsRoute extends Route {
  @service store;
  @service plausible;

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

  static textSearchFields = ['title^3', 'subtitle^3', 'htmlContent'];
  static highlightFields = ['title,subTitle,htmlContent'];

  static postProcessData = (newsItem) => {
    SearchNewsItemsRoute.postProcessHighlights(newsItem);
    // Currently highlights return a snippet. When no highlighting is
    // found, we display the whole text, which is jarring when both
    // are intertwined. So we will have htmlContent contain a
    // snippet as well for consistency. Once we expose the necessary
    // highlighting options via mu-search we can remove this.
    // Note: we don't need to care about unclosed tags. Browsers
    // should deal with that anyway.
    let htmlContent = newsItem.attributes.htmlContent;
    if (htmlContent) {
      htmlContent = htmlContent.split(' ').slice(0, 14).join(' ');
      newsItem.attributes.htmlContent = htmlContent;
    }
    const entry = { ...newsItem.attributes, ...newsItem.highlight };
    entry.id = newsItem.id;
    SearchNewsItemsRoute.postProcessAgendaitems(entry);
    SearchNewsItemsRoute.postProcessMandatees(entry);
    return entry;
  };

  static createFilter(params) {
    const searchModifier = ':sqs:';
    const textSearchKey = SearchNewsItemsRoute.textSearchFields.join(',');

    const filter = {};

    filter[`${searchModifier}${textSearchKey}`] = isEmpty(params.searchText)
    ? '*'
    : filterStopWords(params.searchText);

    if (!isEmpty(params.mandatees)) {
      filter[':terms:agendaitems.mandatees.id'] = params.mandatees;
    }

    if (!isEmpty(params.governmentAreas)) {
      filter[':terms:governmentAreaIds'] = params.governmentAreas;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(params.dateFrom) && !isEmpty(params.dateTo)) {
      const from = startOfDay(parse(params.dateFrom, 'dd-MM-yyyy', new Date()));
      const to = endOfDay(parse(params.dateTo, 'dd-MM-yyyy', new Date())); // "To" interpreted as inclusive
      filter[':lte,gte:agendaitems.meetingDate'] = [
        to.toISOString(),
        from.toISOString(),
      ].join(',');
    } else if (!isEmpty(params.dateFrom)) {
      const date = startOfDay(parse(params.dateFrom, 'dd-MM-yyyy', new Date()));
      filter[':gte:agendaitems.meetingDate'] = date.toISOString();
    } else if (!isEmpty(params.dateTo)) {
      const date = endOfDay(parse(params.dateTo, 'dd-MM-yyyy', new Date())); // "To" interpreted as inclusive
      filter[':lte:agendaitems.meetingDate'] = date.toISOString();
    }

    // Filter out news-items that are not linked to a meeting via treatment(s)/agendaitem(s)
    filter[':has:agendaitems'] = 't';

    return filter;
  }

  async model(filterParams) {
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

    const filter = SearchNewsItemsRoute.createFilter(params);

    const results = await search(
      'news-items',
      params.page,
      params.size,
      params.sort,
      filter,
      SearchNewsItemsRoute.postProcessData,
      {
        fields: SearchNewsItemsRoute.highlightFields,
      }
    );

    this.trackSearch(
      params.searchText,
      results.length,
      params.mandatees,
      params.governmentAreas,
      params.dateFrom,
      params.dateTo,
      params.sort,
    );

    return results;
  }

  async trackSearch(searchTerm, resultCount, mandatees, governmentAreas, from, to, sort) {
    const ministerNames = (
      await Promise.all(
        mandatees?.map((id) => this.store.findRecord('person', id)))
    ).map((person) => person.fullName);

    const governmentAreaLabels = (
      await Promise.all(
        governmentAreas?.map((id) => this.store.findRecord('concept', id)))
    ).map((concept) => concept.label);  

    this.plausible.trackEventWithRole('Zoekopdracht', {
      'Zoekterm': searchTerm,
      'Aantal resultaten': resultCount,
      'Ministers': ministerNames.join(', '),
      'Beleidsdomeinen': governmentAreaLabels.join(', '),
      'Van': from,
      'Tot en met': to,
      'Sorteringsoptie': sort,
    }, true);
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

  static postProcessAgendaitems(newsletter) {
    const agendaitems = newsletter.agendaitems;
    if (Array.isArray(agendaitems)) {
      newsletter.latestAgendaitem = agendaitems.find((agendaitem) => {
        return agendaitem['nextVersionId'] == null;
      });
    } else {
      newsletter.latestAgendaitem = agendaitems;
    }
  }

  static postProcessMandatees(newsletter) {
    const mandatees = newsletter.latestAgendaitem.mandatees;
    if (Array.isArray(mandatees)) {
      const sortedMandatees = mandatees.sortBy('priority');
      newsletter.mandatees = sortedMandatees;
    } else {
      newsletter.mandatees = [mandatees];
    }
  }

  static postProcessHighlights(entry) {
    if (Array.isArray(entry.highlight?.title)) {
      entry.highlight.title = entry.highlight.title[0];
    }

    if (Array.isArray(entry.highlight?.subTitle)) {
      entry.highlight.subTitle = entry.highlight.subTitle[0];
    }

    if (Array.isArray(entry.highlight?.htmlContent)) {
      entry.highlight.htmlContent = entry.highlight.htmlContent[0];
    }
  }
}
