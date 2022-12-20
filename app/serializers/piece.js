import ApplicationSerializer from './application';

const SKIP_SERIALIZED = ['agendaitems', 'submissionActivity', 'decisionActivity', 'documentcontainer', 'meeting'];

export default class PieceSerializer extends ApplicationSerializer {
  serializeHasMany(snapshot, json, relationship) {
    const key = relationship.key;
    if (!SKIP_SERIALIZED.includes(key)) {
      super.serializeHasMany(snapshot, json, relationship);
    }
  }
}
