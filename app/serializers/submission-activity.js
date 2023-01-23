import ApplicationSerializer from './application';

const FORCE_SERIALIZED = ['pieces'];

export default class SubmissionActivitySerializer extends ApplicationSerializer {
  shouldSerializeHasMany(snapshot, key, relationshipType) {
    if (FORCE_SERIALIZED.includes(key)) {
      return true;
    } else {
      return super.shouldSerializeHasMany(snapshot, key, relationshipType);
    }
  }
}
