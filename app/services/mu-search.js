import Service from '@ember/service';
import { ajax } from 'fe-redpencil/utils/ajax';
import { inject } from '@ember/service';
import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';

export default Service.extend({
  store: inject(),

  /**
   * Query mu-search and get back mu-cl-resources objects
   *
   * @param searchType    Name of object type in mu-seach (literally copied into url)
   * @param params        Query parameters, just as you'd supply in 'store.query'
   * @param resourcesType Name of object type in mu-cl-resources, just as you'd supply in 'store.query'
   * @param sortMapping   Mapping between mu-cl-resources object keys and mu-search object keys. Only supply key(s) you want to sort on
   * @return            PromiseArray of mu-cl-resources objects
   */
  query(searchType, params, resourcesType, sortMapping) {
    return this.querySearch(searchType, params, sortMapping).then((searchResults) => {
      if (searchResults.data) {
        const ids = searchResults.data.map(res => res.id);
        if (ids.length === 0) {
          return Promise.resolve(A([]));
        }
        return this.queryResources(resourcesType, ids, params).then((resourceResults) => {
          if (resourceResults.get('meta')) {
            resourceResults.set('meta.count', searchResults.count);
          }
          if (params.page && params.page.number !== undefined && params.page.size) {
            const maxcount = (params.page.number + 1) * params.page.size;
            // const isLast = Boolean(maxcount > searchResults.count);
            resourceResults.set('meta.pagination.first', { size: params.page.size });
            resourceResults.set('meta.pagination.last', {
              number: Math.floor(searchResults.count / params.page.size),
              size: searchResults.count % params.page.size
            });
            resourceResults.set('meta.pagination.self.number', params.page.number);
            if (maxcount < searchResults.count) {
              let nextIsLast = Boolean((maxcount + 1) > searchResults.count);
              const next = {
                number: params.page.number + 1,
                size: nextIsLast ? (searchResults.count % params.page.size) : params.page.size
              };
              resourceResults.set('meta.pagination.next', next);
            }
            if (params.page.number > 0) {
              const previous = {
                number: params.page.number - 1,
                size: params.page.size
              };
              resourceResults.set('meta.pagination.prev', previous);
            }
          }
          // return resourceResults;
          return ArrayProxy.create({
            content: this.loadSearchPropsOnObject(searchResults.data, resourceResults.toArray()),
            meta: resourceResults.get('meta')
          });
        });
      } else {
        return Promise.resolve(A([]));
      }
    });
  },

  querySearch(type, params, sortMapping) {
    return ajax({
      method: 'GET',
      url: this.urlForQuery(params, type, sortMapping)
    });
  },

  queryResources(type, ids, params) {
    let serIds = ids.join();
    const queryParams = {
      filter: {
        'id': serIds
      },
    };
    if (params && params.page && params.page.size) {
      queryParams.page = {
        size: params.page.size
      }
    }
    if (params && params.include) {
      queryParams.include = params.include
    }
    const query = this.store.query(type, queryParams);
    return query.then((results) => {
      if (params.sort) {
        const sortedContent = results.get('content').toArray().sort((a, b) => {
          return ids.indexOf(a.id) - ids.indexOf(b.id);
        });
        results.set('content', A(sortedContent));
      }
      return results;
    })
  },

  sortOrder(sort) {
    if (sort.startsWith('-')) {
      return 'desc';
    } else if (sort.length > 0) {
      return 'asc';
    } else {
      return null;
    }
  },

  stripSort(sort) {
    return sort.replace(/(^\+)|(^-)/g, '');
  },

  urlForQuery(params, type, sortMapping) {
    let filterString = [];

    if (params.filter) {
      filterString = filterString.concat(this.serializeFilterParams(params.filter));
    }
    if (params.sort && sortMapping) {
      filterString = filterString.concat(this.serializeSortParams(params.sort, sortMapping));
    }
    if (params.page) {
      filterString = filterString.concat(this.serializePageParams(params.page));
    }
    filterString.push('collapse_uuids=t');
    return `/${type}/search?${filterString.join('&')}`;
  },

  serializeFilterParams(filter) {
    let params = [];
    for (const param in filter) {
      // The encodeURIComponent below is a patch. Proper solution is to move away from this service and use utils/mu-search
      params.push(`filter[${param}]=${encodeURIComponent(filter[param])}`);
    }
    return params;
  },

  serializePageParams(page) {
    let params = [];
    if (page.size) {
      params.push(`page[size]=${page.size}`);
    }
    if (page.number) {
      params.push(`page[number]=${page.number}`);
    }
    return params;
  },

  serializeSortParams(sort, sortMapping) {
    // sortMapping: object that maps mu-cl-resources resource name to search document key
    let params = [];
    const strippedParam = this.stripSort(sort);
    if (strippedParam in sortMapping) {
      const muSearchKey = sortMapping[strippedParam];
      const order = this.sortOrder(sort);
      params.push(`sort[${muSearchKey}]=${order}`);
    }
    return params;
  },

  /**
   * Load all properties from search objects onto resources objects
   *
   */
  loadSearchPropsOnObject(searchResults, emberDataObjects) {
    for (var i = 0; i < searchResults.length; i++) {
      const searchRes = searchResults[i];
      const edObj = emberDataObjects.findBy('id', searchRes.id);
      const searchAttrs = Object.keys(searchRes.attributes);
      for (const n in searchAttrs) {
        const key = searchAttrs[n];
        if (searchRes.attributes.hasOwnProperty(key) &&
          edObj.get(key) === undefined) {
          edObj.set(key, searchRes.attributes[key]);
        }
      }
      edObj.getRecord = function () {
        return edObj;
      };
    }
    return A(emberDataObjects);
  },


});
