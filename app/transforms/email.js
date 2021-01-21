/* eslint-disable */
// Sourced from https://github.com/mu-semtech/ember-mu-transform-helpers/blob/master/addon/transforms/email.js
import { warn } from '@ember/debug';
import Transform from 'ember-data/transform';

export default Transform.extend({
  deserialize(serialized) {
    if (serialized) {
      if (serialized.match(/^mailto:/)) {
        return serialized.substring('mailto:'.length);
      } else {
        warn(`Expected email URI but got ${JSON.stringify(serialized)} as value`);
      }
    }
    return serialized;
  },

  serialize(deserialized) {
    if (deserialized) {
      return `mailto: ${deserialized}`;
    } else {
      return deserialized;
    }
  }
});
