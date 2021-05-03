import { set } from '@ember/object';
import RSVP from 'rsvp';

// rationale:
// conventional Ember method of assigning queryParams to controller properties could not be used for two reasons:
//  - filter settings are stored on the DocumentsFilter object that is assigned to controller.filter.
//      Ember does not permit to assign query params to other objects than the controller
//  - the DocumentsFilter uses models instead, query parameters are ids. There needs to be a conversion back and forth.
// This class allowed these deviations from the Ember patterns to be centralized

// when using this class
//   cache document-types for performance (this class uses findRecord('document-type', id))
export default class FilterQueryParams {
  static queryParams = {
    filterName: {
      as: 'naam',
      refreshModel: true,
      type: 'string',
      // for own use, not supported by Ember
      _default: '',
    },
    filterExtensions: {
      as: 'extensies',
      refreshModel: true,
      type: 'array',
      _default: [],
    },
    filterDocumentTypeIds: {
      as: 'type',
      refreshModel: true,
      type: 'array',
      _default: [],
    },
  }

  static async readToFilter(store, params) {
    const documentTypePromises = params.filterDocumentTypeIds.map((id) => store.findRecord('document-type', id));

    const documentTypes = await RSVP.all(documentTypePromises);
    const filter = {
      documentName: params.filterName,
      fileTypes: params.filterExtensions,
      documentTypes: documentTypes,
    };

    return filter;
  }

  static updateFromFilterAndReload(controller, filter) {
    const params = this._mapToParamsFormat(filter);
    this._setQueryParams(controller, params);
  }

  static initialize(controller) {
    // no @tracked for performance
    // necessary to make parameter defaults not appear in the url
    for (const [key, value] of Object.entries(this.queryParams)) {
      set(controller, key, value._default);
    }
  }

  static _mapToParamsFormat(filter) {
    const params = {
      filterName: filter.documentName,
      filterDocumentTypeIds: filter.documentTypes.map((it) => it.id),
      filterExtensions: filter.fileTypes,
    };

    return params;
  }

  static _setQueryParams(controller, params) {
    for (const [key, value] of Object.entries(params)) {
      // set would be more performant than setting query parameters with @tracked
      set(controller, key, value);
    }
  }
}
