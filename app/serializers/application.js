import DS from 'ember-data';
import DataTableSerializerMixin from 'ember-data-table/mixins/serializer';

export default DS.JSONAPISerializer.extend(DataTableSerializerMixin, {

  // eslint-disable-next-line no-unused-vars
  shouldSerializeHasMany(snapshot, key, relationshipType) {
    const shouldSerialize = this._super(...arguments);
    // When we ever remove this customization the following many-to-many relationships
    // must still be serialized:
    // * 'case' <-> 'piece' at the side of 'piece'
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
