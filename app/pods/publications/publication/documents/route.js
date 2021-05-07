import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { isPresent } from '@ember/utils';
import DocumentsFilter from 'frontend-kaleidos/utils/documents-filter';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

export default class PublicationDocumentsRoute extends Route {
  @inject store;
  @inject fileService;

  queryParams = {
    filterName: {
      as: 'naam',
      refreshModel: true,
      type: 'string',
    },
    filterExtensions: {
      as: 'extensies',
      refreshModel: true,
      type: 'array',
    },
    filterDocumentTypeIds: {
      as: 'type',
      refreshModel: true,
      type: 'array',
    },
  };

  async model(params) {
    this.case  = await this.modelFor('publications.publication').case;

    const docQueryParams = {
      include: 'cases,document-container,document-container.type',
      'filter[cases][:id:]': this.case.id,
    };
    if (isPresent(params.filterDocumentTypeIds)) {
      docQueryParams['filter[document-container][type][:id:]'] = params.filterDocumentTypeIds.join(',');
    }
    // TODO: filtering on multiple string values currently isn't supported
    // if (isPresent(params.filterExtensions)) {
    //   docQueryParams['filter[file][extension]'] = params.filterExtensions.join(',')
    // }
    if (isPresent(params.filterName)) {
      docQueryParams['filter[name]'] = params.filterName;
    }

    let pieces = await this.store.query('piece', docQueryParams);
    pieces = pieces.toArray();
    if (isPresent(params.filterExtensions)) {
      pieces = await this._filterPieces(pieces, params.filterExtensions);
    }
    pieces = sortPieces(pieces);

    return pieces;
  }

  async afterModel() {
    await this.store.query('document-type', {
      'page[size]': 50,
      sort: 'priority',
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    const params = this.paramsFor('publications.publication.documents');
    controller.case = this.case;
    controller.filter = new DocumentsFilter({
      documentName: params.filterName,
      fileTypes: params.filterExtensions,
      documentTypes: params.filterDocumentTypeIds.map((id) => this.store.peekRecord('document-type', id)),
    });
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
  async _filterPieces(pieces, allowedExtensions) {
    // async filter by mapping and compacting
    const filterResultPromises = pieces.map(async(piece) => {
      if (!await this.pieceHasExtension(piece, allowedExtensions)) {
        return undefined;
      }
      return piece;
    });
    const filterResult = await Promise.all(filterResultPromises);
    return filterResult.compact();
  }

  async pieceHasExtension(piece, allowedExtensions) {
    const file = await piece.file;
    return allowedExtensions.includes(file.extension);
  }

  @action
  refresh() {
    super.refresh();
  }
}
