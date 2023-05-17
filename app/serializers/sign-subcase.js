import ApplicationSerializer from './application';

const SKIP_SERIALIZED = [
  'signMarkingActivity',
  'signPreparationActivity',
  'signCancellationActivity',
  'signCompletionActivity',
  'signSigningActivities',
  'signApprovalActivities',
  'signRefusalActivities',
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
