import {
  computed, get, set
} from '@ember/object';

/**
 * Gets a certain property on a component/class so as to prevent it from making calls
 * TODO: We need to discuss this decorator's usage and perhaps approach the problem this tries to fix in a different way.
 * @param  {String} property    Path to the property on the class
 * @return {Any}                The value on the given property path
 */
export const cached = (property) => computed(property, {
  get() {
    try {
      return get(this, property);
    } catch (exception) {
      console.warn(`Cached property at ${property} was not available, skipping.`, exception);
    }

    return null;
  },
  // eslint-disable-next-line no-unused-vars
  set(key, value) {
    try {
      set(this, property, value);
    } catch (exception) {
      console.warn(`Could not set cached property at ${property}`, exception);
    }

    return value;
  },
});
