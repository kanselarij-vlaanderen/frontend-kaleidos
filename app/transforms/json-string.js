import Transform from '@ember-data/serializer/transform';

export default class JsonStringTransform extends Transform {
  serialize(object) {
    if (object === undefined || object === null) {
      return undefined;
    } else {
      return JSON.stringify(object);
    }
  }
  deserialize(jsonString) {
    if (jsonString === undefined || jsonString === null) {
      return undefined;
    } else {
      return JSON.parse(jsonString);
    }
  }
}
