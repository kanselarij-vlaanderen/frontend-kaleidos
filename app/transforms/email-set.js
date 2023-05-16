import { typeOf } from '@ember/utils';
import { assert } from '@ember/debug';
import Transform from '@ember-data/serializer/transform';
import { warn } from '@ember/debug';

export default class EmailSetTransform extends Transform {
  deserialize(serialized) {
    assert(
      `Expected array but got ${typeOf(serialized)}`,
      !serialized || typeOf(serialized) === 'array'
    );
    return serialized
      ?.filter((email) => {
      if (email.match(/^mailto:/)) {
          return email.substring('mailto:'.length);
        } else {
          warn(
            `Expected email URI but got ${JSON.stringify(email)} as value`
          );
        }
      })
      ?.map((email) => email.substring('mailto:'.length)) || [];
  }

  serialize(deserialized) {
    assert(
      `Expected array but got ${typeOf(deserialized)}`,
      !deserialized || typeOf(deserialized) === 'array'
    );
    return deserialized?.map((email) => {
      if (email) {
        return 'mailto:' + email;
      } else {
        return null;
      }
    }) || [];
  }
}
