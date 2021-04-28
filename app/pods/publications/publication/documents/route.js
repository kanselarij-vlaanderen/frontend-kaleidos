import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject } from '@ember/service';
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
    // and use them in DocumentsFilterComponent
    this.documentTypes = await this._loadDocumentTypes();
    this.filter = await FilterQueryParams.readToFilter(this.store, params);
    this.case  = this.modelFor('publications.publication').case;

    const modelData = await this._loadModel(this.case, this.filter);

    // use array to allow iteration (for sorting)
    const model = await this.sortAndFilterPieces(modelData.toArray());

    return model;
  }

  async _loadModel(_case, filter) {
    const storeQueryFilter = {
      'filter[cases][:id:]': _case.id,
    };
    if (filter.documentTypes.length) {
      storeQueryFilter['filter[document-container][type][:id:]'] = filter.documentTypes.map((it) => it.id).join(',');
    }
    // TODO: FIGURE OUT. THIS DOES NOT WORK YET FOR MULTIPLE FILE TYPES
    // temporary solution: frontend filtering in controller.sortAndFilterPieces
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
    controller.documentTypes = this.documentTypes;
    controller.filter = new DocumentsFilter(this.filter);
  }

  resetController(controller) {
    controller.newPieces = [];
    controller.filter.reset();
    controller.selectedPieces = [];
    controller.filteredSortedPices = [];
    controller.isLoaded = false;
    controller.showLoader = false;
  }

  async sortAndFilterPieces(pieces) {
    const sortedPieces = sortPieces(pieces);

    let filteredSortedPieces;
    // Als we geen types hebben geselecteerd, laten we alles zien.
    if (!this.isFilterFileTypeActive()) {
      filteredSortedPieces = sortedPieces;
    } else {
      // Filtering of file extensions is not yet possible in the backend, so we do it here.
      // in parallel
      const filterResultPromises = sortedPieces.map(async(piece) => {
        if (!await this.filterFileType(piece)) {
          return undefined;
        }
        return piece;
      });

      const filterResult = await Promise.all(filterResultPromises);
      filteredSortedPieces = filterResult.compact();
    }

    return filteredSortedPieces;
  }

  isFilterFileTypeActive() {
    return !!this.filter.fileTypes.length;
  }

  async filterFileType(piece) {
    // await since not "include"-ed in query
    const file = await piece.get('file');
    const ext = file.extension;
    if (!ext) {
      return false;
    }
    return this.filter.fileTypes.includes(ext);
  }

  @action
  refresh() {
    super.refresh();
  }
}
