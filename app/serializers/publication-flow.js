import ApplicationSerializer from './application';

const SKIP_SERIALIZED = ['mandatees', 'publicationStatusChange'];

export default class PublicationFlowSerializer extends ApplicationSerializer {
  serializeBelongsTo(snapshot, json, relationship) {
    const key = relationship.key;
    if (!SKIP_SERIALIZED.includes(key)) {
      super.serializeBelongsTo(snapshot, json, relationship);
    }
  }

  serializeHasMany(snapshot, json, relationship) {
    const key = relationship.key;
    if (!SKIP_SERIALIZED.includes(key)) {
      super.serializeHasMany(snapshot, json, relationship);
    }
  }

  shouldSerializeHasMany(snapshot, key, relationshipType) {
    if (key === 'mandatees') {
      return true;
    } else {
      return super.shouldSerializeHasMany(snapshot, key, relationshipType);
    }
  }
}
