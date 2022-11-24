import Ember from 'ember';

export function sliceText(params, hash) {
  var value = params[0];
  var left = hash.start;
  var right = hash.limit;
  var remove = hash.remove;
  var removeSecond = hash.removeSecond;
  var removeType = hash.removeType;
  var out = '';

  if (value !== undefined) {
    if (remove !== undefined) {
      if (removeType !== undefined) {
        out = value.substr(left, right).replace(remove, '').replace(removeSecond, '').replace('BIS', '').replace('TRIS', '').replace('QUAD', '');
      }
      else {
        out = value.substr(left, right).replace(remove, '').replace(removeSecond, '');
      }
    } else {
      out = value.substr(left, right);
    }
  } else {
    out = '';
  }

  return out;
}

export default Ember.Helper.helper(sliceText);
