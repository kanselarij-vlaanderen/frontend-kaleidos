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
  }
}
