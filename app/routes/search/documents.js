import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { warn } from '@ember/debug';
import { startOfDay, endOfDay, parse } from 'date-fns';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import filterStopWords from 'frontend-kaleidos/utils/filter-stopwords';

export default class SearchDocumentsRoute extends Route {
  @service store;
  @service plausible;

  queryParams = {
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
    documentTypes: {
      refreshModel: true,
      as: 'document_types',
    },
  };

  static textSearchFields = ['title^3', 'fileName^2', 'data.content'];
  static highlightFields = ['title', 'fileName', 'data.content'];

  static postProcessData = async (searchData, store) => {
    await SearchDocumentsRoute.postProcessAccessLevel(
      searchData,
      store
    );
    SearchDocumentsRoute.postProcessAgendaitems(searchData);
    return searchData;
  };

  static createFilter(params) {
    const searchModifier = ':sqs:';
    const textSearchKey = SearchDocumentsRoute.textSearchFields.join(',');

    const filter = {};

    filter[`${searchModifier}${textSearchKey}`] = isEmpty(params.searchText)
    ? '*'
    : filterStopWords(params.searchText);

    if (!isEmpty(params.mandatees)) {
      filter[':terms:mandateeIds'] = params.mandatees;
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

    if (params.confidentialOnly) {
      filter[':terms:accessLevel'] = [
        CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE,
        CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
      ];
    }

    if (params.documentTypes && params.documentTypes.length) {
      filter[':terms:documentType'] = params.documentTypes;
    }

    // we only want to show latest piece
    filter[':has-no:nextPieceId'] = 't';

    return filter;
  }

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async model(filterParams) {
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

    const filter = SearchDocumentsRoute.createFilter(params);

    this.lastParams.commit();

    // agendaitems.meetingDate can contain multiple values.
    // Depending on the sort order (desc, asc) we need to aggregrate the values using min/max
    let sort = params.sort;
    if (params.sort === 'agendaitems.meetingDate') {
      sort = ':min:agendaitems.meetingDate';
    } else if (params.sort === '-agendaitems.meetingDate') {
      sort = '-:max:agendaitems.meetingDate'; // correctly converted to mu-search syntax by the mu-search util
    }

    // in case we only want to show pieces with connected agendaitems
    // filter[':has:agendaitems'] = 't';

    const results = search(
      'pieces',
      params.page,
      params.size,
      sort,
      filter,
      (document) => SearchDocumentsRoute.postProcessData(document, this.store),
      {
        fields: SearchDocumentsRoute.highlightFields,
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
      params.documentTypes,
      params.confidentialOnly,
    );

    return results;
  }

  async trackSearch(searchTerm, resultCount, mandatees, governmentAreas, from, to, sort, types, confidentialOnly) {
    const ministerNames = (
      await Promise.all(
        mandatees?.map((id) => this.store.findRecord('person', id)))
    ).map((person) => person.fullName);

    const typeNames = (
      await Promise.all(
        types?.map((id) => this.store.findRecord('concept', id)))
    ).map((document) => document.label);

    const governmentAreaLabels = (
      await Promise.all(
        governmentAreas?.map((id) => this.store.findRecord('concept', id)))
    ).map((concept) => concept.label);  


    this.plausible.trackEventWithRole('Zoekopdracht', {
      'Zoekterm': searchTerm,
      'Ministers': ministerNames.join(', '),
      'Beleidsdomeinen': governmentAreaLabels.join(', '),
      'Van': from,
      'Tot en met': to,
      'Sorteringsoptie': sort,
      'Aantal resultaten': resultCount,
      'Documenttypes': typeNames.join(', '),
      'Enkel vertrouwelijke documenten': confidentialOnly,
    }, true);
  }

  setupController(controller) {
    super.setupController(...arguments);
    const searchText = this.paramsFor('search').searchText;

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }

    controller.searchText = searchText;
    controller.loadDocumentTypes.perform();
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

  static async postProcessAccessLevel(entry, store) {
    if (entry.attributes.accessLevel) {
      if (Array.isArray(entry.attributes.accessLevel)) {
        warn(
          `Piece ${entry.attributes.id} has multiple access levels. We will display the first one`,
          { id: 'piece.multiple-access-levels' }
        );
        entry.attributes.accessLevel = entry.attributes.accessLevel[0];
      }
      entry.attributes.accessLevel = await store.findRecordByUri(
        'concept',
        entry.attributes.accessLevel
      );
    }
  }

  static postProcessAgendaitems(entry) {
    const agendaitems = entry.attributes.agendaitems;
    if (Array.isArray(agendaitems)) {
      entry.attributes.latestAgendaitem = agendaitems.find((agendaitem) => {
        return agendaitem['nextVersionId'] == null;
      });
    } else {
      entry.attributes.latestAgendaitem = agendaitems;
    }
    const meetingDate = entry.attributes.latestAgendaitem?.meetingDate;
    if (meetingDate) {
      if (Array.isArray(meetingDate)) {
        const sorted = meetingDate.sort();
        entry.attributes.meetingDate = sorted[sorted.length - 1];
      } else {
        entry.attributes.meetingDate = meetingDate;
      }
    }
  }
}
