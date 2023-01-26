import ApplicationSerializer from './application';

const SKIP_SERIALIZED = ['newsItem'];

export default class AgendaItemTreatmentSerializer extends ApplicationSerializer {
  serializeBelongsTo(snapshot, json, relationship) {
    const key = relationship.key;
    if (!SKIP_SERIALIZED.includes(key)) {
      super.serializeBelongsTo(snapshot, json, relationship);
    }
  }
}
