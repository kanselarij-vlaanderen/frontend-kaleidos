import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class ApplicationSerializer extends JSONAPISerializer {
  /**
   * Parse the links in the JSONAPI response and convert to a meta-object
   * Source: https://github.com/mu-semtech/ember-data-table/blob/master/addon/mixins/serializer.js
  */
  normalizeQueryResponse(_store, _clazz, payload) {
    const result = super.normalizeQueryResponse(...arguments);
    result.meta = result.meta || {};

    if (payload.links) {
      result.meta.pagination = this.createPageMeta(payload.links);
    }
    if (payload.meta) {
      result.meta.count = payload.meta.count;
    }

    return result;
  }

  /**
   * Transforms link URLs to objects containing metadata
   * E.g.
   * {
   *   previous: '/streets?page[number]=1&page[size]=10&sort=name
   *   next: '/streets?page[number]=3&page[size]=10&sort=name
   * }
   * will be converted to
   * {
   *   previous: { number: 1, size: 10 },
   *   next: { number: 3, size: 10 }
   * }
   * Source: https://github.com/mu-semtech/ember-data-table/blob/master/addon/mixins/serializer.js
   */
  createPageMeta(data) {
    let meta = {};

    Object.keys(data).forEach((type) => {
      const link = data[type];
      meta[type] = {};

      if (link) {
        //extracts from '/path?foo=bar&baz=foo' the string: foo=bar&baz=foo
        const query = link.split(/\?(.+)/)[1] || '';

        query.split('&').forEach((pairs) => {
          const [param, value] = pairs.split('=');

          if (decodeURIComponent(param) === 'page[number]') {
            meta[type].number = parseInt(value);
          } else if (decodeURIComponent(param) === 'page[size]') {
            meta[type].size = parseInt(value);
          }
        });
      }
    });

    return meta;
  }

  // eslint-disable-next-line no-unused-vars
  shouldSerializeHasMany(snapshot, key, relationshipType) {
    // If serialization option specified, use that. Otherwise use Ember Data defaults
    if (relationshipType.options && (typeof relationshipType.options.serialize !== 'undefined')) {
      return relationshipType.options.serialize;
    }
    return super.shouldSerializeHasMany(...arguments);
  }

  // eslint-disable-next-line no-unused-vars
  serializeBelongsTo(snapshot, json, relationship) {
    // If serialization option specified and set to false, don't serialize.
    // Otherwise use Ember Data defaults which will always serialize a belongsTo
    if (relationship.options && relationship.options.serialize === false) {
      return;
    }
    super.serializeBelongsTo(...arguments);
  }

  serialize() {
    const payload = super.serialize(...arguments);
    if (payload && payload.data && payload.data.attributes) {
      delete payload.data.attributes.uri;
    }
    return payload;
  }
}
