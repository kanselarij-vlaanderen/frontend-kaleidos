/* eslint-disable */
import DS from 'ember-data';
import DataTableSerializerMixin from 'ember-data-table/mixins/serializer';

export default DS.JSONAPISerializer.extend(DataTableSerializerMixin, {

  // eslint-disable-next-line no-unused-vars
  shouldSerializeHasMany(snapshot, key, relationshipType) {
    return false;
    const shouldSerialize = this._super(...arguments);
    const serializeOption = relationshipType.options || {
      serialize: true,
    };
    if (typeof serializeOption.serialize !== 'undefined') {
      return shouldSerialize && serializeOption.serialize;
    }
    return shouldSerialize;
  },

  serialize() {
    const payload = this._super(...arguments);
    if (payload && payload.data && payload.data.attributes) {
      delete payload.data.attributes.uri;
    }
    return payload;
  },
});