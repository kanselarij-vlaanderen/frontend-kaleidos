import DS from 'ember-data';
import DataTableSerializerMixin from 'ember-data-table/mixins/serializer';

export default DS.JSONAPISerializer.extend(DataTableSerializerMixin, {

  shouldSerializeHasMany(snapshot, key, relationshipType) {
    let shouldSerialize = this._super(...arguments);
    let serializeOption = relationshipType.options || { serialize: true };
    if (typeof serializeOption.serialize != 'undefined') {
      return shouldSerialize && serializeOption.serialize;
    }
    return shouldSerialize;
  },

  serialize() {
    let payload = this._super(...arguments);
    if (payload && payload.data && payload.data.attributes) {
      delete payload.data.attributes.uri;
    }
    return payload;
  },
});
