import { set } from '@ember/object';
import { all as allPromises } from 'rsvp';

// utility class to centralize filter query parameter read and write
// cache document-types for performance (this class uses findRecord('document-type', id))
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
    },
    [this.queryParamMapping.documentTypes]: {
      as: 'type',
      refreshModel: true,
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
      set(controller, value, params[key]);
    }
  }

  static _deserializeQueryParams(params) {
    const KEY_DOCUMENT_TYPES = this.queryParamMapping.documentTypes;
    const KEY_DOCUMENT_NAME = this.queryParamMapping.documentName;
    const KEY_FILE_TYPES = this.queryParamMapping.fileTypes;

    const documentTypeIds = params[KEY_DOCUMENT_TYPES] ? params[KEY_DOCUMENT_TYPES].split(',') : [];
    const documentName = params[KEY_DOCUMENT_NAME];
    const fileExtensions = params[KEY_FILE_TYPES] ? params[KEY_FILE_TYPES].split(',') : [];

    const deserializedParams = {
      documentTypes: documentTypeIds,
      documentName,
      fileTypes: fileExtensions,
    };

    return deserializedParams;
  }

  static async _deserializedQueryParamsToFilter(store, params) {
    const documentTypes = params.documentTypes.map((id) => store.findRecord('document-type', id));

    const filter = {
      documentName: params.documentName,
      fileTypes: params.fileTypes,
      documentTypes: await allPromises(documentTypes),
    };

    return filter;
  }

  static _filterToQueryParams(filter) {
    const params = {
      documentName: filter.documentName,
      documentTypes: filter.documentTypes.map((it) => it.id).join(','),
      fileTypes: filter.fileTypes.join(','),
    };

    return params;
  }
}
