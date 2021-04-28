import { set } from '@ember/object';
import EmberPromise from 'rsvp';

// rationale:
// conventional Ember method of assigning queryParams to controller properties could not be used for two reasons:
//  - filter settings are stored on the DocumentsFilter object that is assigned to controller.filter.
//      Ember does not permit to assign query params to other objects than the controller
//  - the DocumentsFilter uses models instead, query parameters are ids. There needs to be a conversion back and forth.
// This class allowed these deviations from the Ember patterns to be centralized

// when using this class
//   cache document-types for performance (this class uses findRecord('document-type', id))
export default class FilterQueryParams {
  static queryParamMapping = {
    documentTypes: 'filterQueryParams$documentTypes',
    documentName: 'filterQueryParams$documentName',
    fileTypes: 'filterQueryParams$fileTypes',
  }

  static queryParams = {
    [this.queryParamMapping.documentName]: {
      as: 'naam',
      refreshModel: true,
    },
    [this.queryParamMapping.fileTypes]: {
      as: 'bestandstype',
      refreshModel: true,
      type: 'array',
    },
    [this.queryParamMapping.documentTypes]: {
      as: 'type',
      refreshModel: true,
      type: 'array',
    },
  }

  static async readToFilter(store, params) {
    const deserializedParams = this._deserializeQueryParams(params);
    const filterState = this._deserializedQueryParamsToFilter(store, deserializedParams);
    return filterState;
  }

  static updateFromFilterAndReload(controller, filter) {
    const params = this._filterToQueryParams(filter);
    for (const [key, value] of Object.entries(FilterQueryParams.queryParamMapping)) {
      // set would be more performant than setting query parameters with @tracked
      set(controller, value, params[key]);
    }
  }

  static _deserializeQueryParams(params) {
    const KEY_DOCUMENT_TYPES = this.queryParamMapping.documentTypes;
    const KEY_DOCUMENT_NAME = this.queryParamMapping.documentName;
    const KEY_FILE_TYPES = this.queryParamMapping.fileTypes;

    const documentTypes = params[KEY_DOCUMENT_TYPES] || [];
    const documentName = params[KEY_DOCUMENT_NAME] || '';
    const fileExtensions = params[KEY_FILE_TYPES] || [];

    const deserializedParams = {
      documentTypes: documentTypes,
      documentName,
      fileTypes: fileExtensions,
    };

    return deserializedParams;
  }

  static async _deserializedQueryParamsToFilter(store, params) {
    const documentTypePromises = params.documentTypes.map((id) => store.findRecord('document-type', id));

    const documentTypes = await EmberPromise.all(documentTypePromises);
    const filter = {
      documentName: params.documentName,
      fileTypes: params.fileTypes,
      documentTypes: documentTypes,
    };

    return filter;
  }

  static _filterToQueryParams(filter) {
    const params = {
      documentName: filter.documentName,
      documentTypes: filter.documentTypes.map((it) => it.id),
      fileTypes: filter.fileTypes,
    };

    return params;
  }
}
