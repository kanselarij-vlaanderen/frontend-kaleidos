import ApplicationSerializer from './application';

// does not pass the piece serializer so we need to skip the same relations here aswell
const SKIP_SERIALIZED = [
  'signedPiece',
  'signedPieceCopy',
  'signMarkingActivity',
  'signCompletionActivity',
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
}
