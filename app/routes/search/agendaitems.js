import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { parse, startOfDay, endOfDay } from 'date-fns';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import filterStopWords from 'frontend-kaleidos/utils/filter-stopwords';

export default class AgendaitemSearchRoute extends Route {
  @service store;
  @service plausible;

  queryParams = {
    types: {
      refreshModel: true,
    },
    latestOnly: {
      refreshModel: true,
      as: 'uitsluitend-laatste-versie',
    },
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

  static textSearchFields = [
    'title^4',
    'shortTitle^4',
    'mandateRoles^2',
    'mandateeFirstNames^3',
    'mandateeFamilyNames^3',
    'pieceNames^2',
    'pieceFileNames^2',
    'pieces.content',
    'decisionName^2',
    'decisionFileName^2',
    'decision.content',
    'newsItemTitle^2',
    'newsItem',
  ];
  static highlightFields = ['shortTitle,title'];

  static postProcessData = (agendaitem) => {
    const entry = { ...agendaitem.attributes, ...agendaitem.highlight };
    entry.id = agendaitem.id;
    AgendaitemSearchRoute.postProcessPastAgendaVersions(entry);

    if (entry.shortTitle && Array.isArray(entry.shortTitle)) {
      entry.shortTitle = entry.shortTitle.join(' ');
    }
    if (entry.title && Array.isArray(entry.title)) {
      entry.title = entry.title.join(' ');
    }
    return entry;
  };

  static createFilter(params) {
    const searchModifier = ':sqs:';
    const textSearchKey = AgendaitemSearchRoute.textSearchFields.join(',');

    const filter = {};

    if (!isEmpty(params.searchText)) {
      filter[`${searchModifier}${textSearchKey}`] = filterStopWords(params.searchText);
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

    // all-types also needs this filtering (default = true, toggleable in current route)
    if (params.latestOnly) {
      filter[':has-no:nextVersionId'] = 't';
    }

    return filter;
  }

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
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
    this.lastParams.stageLive(params);

    if (
      this.lastParams.anyFieldChanged(
        Object.keys(params).filter((key) => key !== 'page')
      )
    ) {
      params.page = 0;
    }

    const filter = AgendaitemSearchRoute.createFilter(params);

    if (params.types.length) {
      if (
        params.types.includes('nota') &&
        !params.types.includes('mededeling')
      ) {
        filter.type = CONSTANTS.AGENDA_ITEM_TYPES.NOTA;
      } else if (
        params.types.includes('mededeling') &&
        !params.types.includes('nota')
      ) {
        filter.type = CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT;
      }
    }

    this.lastParams.commit();

    if (isEmpty(params.searchText)) {
      return [];
    }

    const results = await search(
      'agendaitems',
      params.page,
      params.size,
      params.sort,
      filter,
      AgendaitemSearchRoute.postProcessData,
      {
        fields: AgendaitemSearchRoute.highlightFields,
      }
    );

    this.trackSearch(
      params.searchText,
      results.length,
      params.mandatees,
      params.dateFrom,
      params.dateTo,
      params.sort,
      params.types,
      params.latestOnly,
    );

    return results;
  }

  async trackSearch(searchTerm, resultCount, mandatees, from, to, sort, types, latestOnly) {
    const ministerNames = (
      await Promise.all(
        mandatees?.map((id) => this.store.findRecord('person', id)))
    ).map((person) => person.fullName);

    this.plausible.trackEventWithRole('Zoekopdracht', {
      'Zoekterm': searchTerm,
      'Ministers': ministerNames.join(', '),
      'Van': from,
      'Tot en met': to,
      'Sorteringsoptie': sort,
      'Aantal resultaten': resultCount,
      'Agendapunt types': types.join(', '),
      'Enkel definitieve agenda': latestOnly,
    }, true);
  }

  setupController(controller) {
    super.setupController(...arguments);
    const searchText = this.paramsFor('search').searchText;

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }

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

  static postProcessPastAgendaVersions(entry) {
    if (entry.agendaitemTreatment) {
      const pastAgendaitems = entry.agendaitemTreatment.agendaitems;
      if (Array.isArray(pastAgendaitems)) {
        entry.pastAgendaVersions = pastAgendaitems
          .map((agendaitem) => agendaitem.agendaSerialNumber)
          .filter(
            (agendaSerialNumber) =>
              agendaSerialNumber != entry.agendaSerialNumber
          )
          .sort();
      }
    }
  }
}
