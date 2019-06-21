import DS from 'ember-data';
import DataTableSerializerMixin from 'ember-data-table/mixins/serializer';

export default DS.JSONAPISerializer.extend(DataTableSerializerMixin, {
  shouldSerializeHasMany(snapshot, key, relationshipType) {
    let shouldSerialize = this._super(...arguments);
    let serializeOption = relationshipType.options || { serialize: true };
    if (typeof serializeOption.serialize != "undefined") {
      return shouldSerialize && serializeOption.serialize;
    }
    return shouldSerialize;
  },

  handleResponse: function (status, headers, payload) {
    console.log(status, headers, payload)
    if (!this.isSuccess(status, headers, payload)) {
      if (payload.error) {
        console.log(payload.error)
        return new DS.InvalidError([payload.error]);
      } else {
        return this._super(...arguments);
      }
    } else {
      return this._super(...arguments);
    }
  }
});
