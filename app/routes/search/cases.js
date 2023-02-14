import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { startOfDay, endOfDay, parse } from 'date-fns';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';

export default class CasesSearchRoute extends Route {
  queryParams = {
    archived: {
      refreshModel: true,
      as: 'gearchiveerd',
    },
    decisionsOnly: {
      refreshModel: true,
      as: 'enkel_beslissingen',
    },
    confidentialOnly: {
      refreshModel: true,
      as: 'enkel_vertrouwelijk',
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

  postProcessDates(_case) {
    const { sessionDates } = _case.attributes;
    if (sessionDates) {
      if (Array.isArray(sessionDates)) {
        const sorted = sessionDates.sort();
        _case.attributes.sessionDates = sorted[sorted.length - 1];
      } else {
        _case.attributes.sessionDates = sessionDates;
      }
    }
  }

  postProcessAgendaItems(case_) {
    const { agendaItems } = case_.attributes;
    if (agendaItems) {
      if (!Array.isArray(agendaItems)) {
        case_.attributes.agendaItems = [agendaItems];
      }
    }
  }

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = { ...searchParams, ...filterParams };

    this.lastParams.stageLive(params);

    if (
      this.lastParams.anyFieldChanged(
        Object.keys(params).filter((key) => key !== 'page')
      )
    ) {
      params.page = 0;
    }

    const textSearchFields = [
      'title^4',
      'shortTitle^4',
      'subcaseTitle^2',
      'subcaseSubTitle^2',
      'mandateRoles^2',
      'mandateeFirstNames^3',
      'mandateeFamilyNames^3',
      'newsItemTitle^2',
      'newsItem',
    ];
    if (params.decisionsOnly) {
      textSearchFields.push(...['decisionNames^2', 'decisionFileNames^2', 'decisions.content']);
    } else {
      textSearchFields.push(...['documentNames^2', 'documentFileNames^2', 'documents.content']);
    }

    const searchModifier = ':sqs:';
    const textSearchKey = textSearchFields.join(',');

    const filter = {};

    if (!isEmpty(params.searchText)) {
      filter[searchModifier + textSearchKey] = params.searchText;
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

    if (params.archived === 'hide') {
      filter.isArchived = 'false';
    } else if (params.archived === 'only') {
      filter.isArchived = 'true';
    }

    if (params.confidentialOnly) {
      filter.subcaseConfidential = 'true';
    }

    this.lastParams.commit();

    if (isEmpty(params.searchText)) {
      return [];
    }

    // session-dates can contain multiple values.
    // Depending on the sort order (desc, asc) we need to aggregrate the values using min/max
    let sort = params.sort;
    if (params.sort === 'session-dates') {
      sort = ':min:session-dates';
    } else if (params.sort === '-session-dates') {
      sort = '-:max:session-dates'; // correctly converted to mu-search syntax by the mu-search util
    }

    return search(
      'decisionmaking-flows',
      params.page,
      params.size,
      sort,
      filter,
      (searchData) => {
        this.postProcessDates(searchData);
        this.postProcessAgendaItems(searchData);
        const entry = { ...searchData.attributes, ...searchData.highlight };
        entry.id = searchData.id;
        if (entry.shortTitle && Array.isArray(entry.shortTitle)) {
          entry.shortTitle = entry.shortTitle.join('');
        }
        return entry;
      },
      ['shortTitle']
    );
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
}
