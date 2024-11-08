import ApplicationSerializer from './application';

const SKIP_SERIALIZED = [
  'agendaitems',
  'submissionActivity',
  'signedPiece',
  'signedPieceCopy',
  'signMarkingActivity',
  'signCompletionActivity',
];

const SKIP_ATTRIBUTES = [
  'stamp',
  'originalName'
];

const SAVE_ONLY_DIRTY_ATTRIBUTES = [
  'originalName'
];

export default class PieceSerializer extends ApplicationSerializer {
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

  serializeAttribute(snapshot, json, key, attribute) {
    if (!SKIP_ATTRIBUTES.includes(key)) {
      super.serializeAttribute(snapshot, json, key, attribute);
    }
    else {
      // only save attribute when it is dirty to avoid concurrency with backend.
      const changedAttributes = snapshot?._changedAttributes;
      for (const dirtyAttribute of SAVE_ONLY_DIRTY_ATTRIBUTES) {
        if (changedAttributes[dirtyAttribute]) {
          super.serializeAttribute(snapshot, json, key, attribute);
        }
      }
    }
  }
}
