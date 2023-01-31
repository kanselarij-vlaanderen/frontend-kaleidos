import ApplicationSerializer from './application';

const SKIP_SERIALIZED = ['previousVersion', 'nextVersion'];

export default class AgendaitemSerializer extends ApplicationSerializer {
  serializeBelongsTo(snapshot, json, relationship) {
    const key = relationship.key;
    if (!SKIP_SERIALIZED.includes(key)) {
      super.serializeBelongsTo(snapshot, json, relationship);
    }
  }
}
