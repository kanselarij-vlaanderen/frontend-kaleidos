import { computed } from '@ember/object';

export const cached = (property) => {
  return computed(`item.${property}`, {
    get() {
      const { item } = this;
      if (item) {
        return item.get(property);
      }

      return null;
    },
    set: function (key, value) {
      const { item } = this;
      if (item) {
        this.item.set(property, value);
      }
      return value;
    }
  });
}
