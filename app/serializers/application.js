import DS from 'ember-data';
import DataTableSerializerMixin from 'ember-data-table/mixins/serializer';

export default DS.JSONAPISerializer.extend(DataTableSerializerMixin, {

  // eslint-disable-next-line no-unused-vars
  shouldSerializeHasMany(snapshot, key, relationshipType) {
    // If serialization option specified, use that. Otherwise use Ember Data defaults
    if (relationshipType.options && (typeof relationshipType.options.serialize !== 'undefined')) {
      return relationshipType.options.serialize;
    }
    return this._super(...arguments);
  },

  // eslint-disable-next-line no-unused-vars
  serializeBelongsTo(snapshot, json, relationship) {
    // If serialization option specified and set to false, don't serialize.
    // Otherwise use Ember Data defaults which will always serialize a belongsTo
    if (relationship.options && (typeof relationship.options.serialize !== 'undefined')) {
      return;
    }
    this._super(...arguments);
  },

  serialize() {
    const payload = this._super(...arguments);
    if (payload && payload.data && payload.data.attributes) {
      delete payload.data.attributes.uri;
    }
    return payload;
  },
});
