import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { isPresent } from '@ember/utils';
import DocumentsFilter from 'frontend-kaleidos/utils/documents-filter';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import FilterQueryParams from './filter-query-params';

export default class PublicationDocumentsRoute extends Route {
  @inject store;
  @inject fileService;

  queryParams = {
    ...FilterQueryParams.queryParams,
  };

  async model(params) {
    // caching for use in QueryParams.queryParamsToFilter
    await this._loadDocumentTypes();
    this.filter = await FilterQueryParams.readToFilter(this.store, params);
    this.case  = this.modelFor('publications.publication').case;

    let pieces = await this._loadModel(this.case, this.filter);
    pieces = await this._filterPieces(pieces.toArray());
    pieces = sortPieces(pieces);

    return pieces;
  }

  async _loadModel(_case, filter) {
    const storeQueryFilter = {
      'filter[cases][:id:]': _case.id,
    };
    if (filter.documentTypes.length) {
      storeQueryFilter['filter[document-container][type][:id:]'] = filter.documentTypes.map((it) => it.id).join(',');
    }
    // TODO: filtering on multiple string values currently isn't supported
    // if (filter.fileTypes.length) {
    //   storeQueryFilter['filter[file][extension]'] = ?
    // }
    if (filter.documentName) {
      storeQueryFilter['filter[name]'] = filter.documentName;
    }

    const modelData = await this.store.query('piece', {
      include: 'cases,document-container,document-container.type',
      ...storeQueryFilter,
    });

    return modelData;
  }

  async _loadDocumentTypes() {
    return await this.store.query('document-type', {
      page: {
        size: 50,
      },
      sort: 'priority',
    });
  }

  setupController(controller) {
    super.setupController(...arguments);

    controller.case = this.case;
    controller.filter = new DocumentsFilter(this.filter);
  }

  // eslint-disable-next-line no-unused-vars
  resetController(controller, isExiting, transition) {
    controller.newPieces = [];
    controller.selectedPieces = [];
    controller.showLoader = false;
  }

  /*
   * filtering based on multiple string values is not yet possible in the backend, so we do it here.
   */
  async _filterPieces(pieces) {
    if (isPresent(this.filter.fileTypes)) {
      // async filter by mapping and compacting
      const filterResultPromises = pieces.map(async(piece) => {
        if (!await this.filterFileType(piece)) {
          return undefined;
        }
        return piece;
      });
      const filterResult = await Promise.all(filterResultPromises);
      return filterResult.compact();
    }
    return pieces;
  }

  async filterFileType(piece) {
    const file = await piece.file;
    return this.filter.fileTypes.includes(file.extension);
  }

  @action
  refresh() {
    super.refresh();
  }
}
