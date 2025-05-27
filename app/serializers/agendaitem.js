import ApplicationSerializer from './application';

const SKIP_SERIALIZED = ['previousVersion', 'nextVersion'];

// we have to skip in order to determine if it's dirty or not.
const SKIP_ATTRIBUTES = [
  'number'
];

const SAVE_ONLY_DIRTY_ATTRIBUTES = [
  'number'
];

export default class AgendaitemSerializer extends ApplicationSerializer {
  serializeBelongsTo(snapshot, json, relationship) {
    const key = relationship.key;
    if (!SKIP_SERIALIZED.includes(key)) {
      super.serializeBelongsTo(snapshot, json, relationship);
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
