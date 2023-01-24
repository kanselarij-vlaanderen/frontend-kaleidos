import ApplicationSerializer from './application';

const SKIP_SERIALIZED = ['subcases'];

export default class DecisionmakingFlowSerializer extends ApplicationSerializer {
  serializeHasMany(snapshot, json, relationship) {
    const key = relationship.key;
    if (!SKIP_SERIALIZED.includes(key)) {
      super.serializeHasMany(snapshot, json, relationship);
    }
  }
}
