import ApplicationSerializer from './application';

const SKIP_SERIALIZED = [
  'parliamentRetrievalActivity',
  'agendaActivities',
  'submissionActivities',
  'decisionActivities',
  'submissions',
  'internalReview'
];

const SKIP_ATTRIBUTES = [
  'agendaActivityNumber'
];

export default class SubcaseSerializer extends ApplicationSerializer {
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
